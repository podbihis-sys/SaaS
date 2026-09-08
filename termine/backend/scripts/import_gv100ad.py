"""Import the official municipality register (GV100AD) from Destatis.

    python -m scripts.import_gv100ad                 # current quarter
    python -m scripts.import_gv100ad --zip file.zip  # a saved copy

GV-ISys, the "Gemeindeverzeichnis-Informationssystem" of the Statistische
Ämter des Bundes und der Länder, is the authoritative list of every politically
independent municipality in Germany: ~10,900 Gemeinden with their Amtlicher
Gemeindeschlüssel (AGS), Kreis, Land, population and the postcode of the
administrative seat. Destatis publishes a quarterly extract, GV100AD, as a
fixed-width text file. This script turns it into ``app/data/gv100ad.json``,
which the seeder loads into the ``municipalities`` table.

The register is what makes "enter your postcode or town and land at the right
authority" possible: the AGS says which Gemeinde a place is, the Kreis key says
which Landkreis is responsible for the errands a Gemeinde does not handle
itself (vehicle registration, driving licences, foreigners' office), and the
seat postcode resolves a good half of all postcodes exactly. The remaining
postcodes — cities with more than one — are looked up through the OpenPLZ API
on first use; see ``app/services/places.py``.

Record layout (Datensatzbeschreibung_GV100AD.pdf, Satzart 60, 220 chars):
positions are *character* positions in a UTF-8 file, not byte offsets.

Licence: "Vervielfältigung und Verbreitung, auch auszugsweise, mit
Quellenangabe gestattet" (Hinweise.txt). Source: © Statistisches Bundesamt
(Destatis), Gemeindeverzeichnis GV100AD.
"""

from __future__ import annotations

import argparse
import asyncio
import io
import json
import re
import sys
import zipfile
from pathlib import Path

from app.providers.base import build_client
from app.providers.robots import robots

TARGET = Path(__file__).resolve().parent.parent / "app" / "data" / "gv100ad.json"

#: The current-quarter page. Destatis keeps the newest extract behind a stable
#: "Aktuell" link per quarter; the quarter that is current depends on the date.
ARCHIVE = (
    "https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/"
    "Administrativ/Archiv/GV100ADQ/GV100AD{quarter}QAktuell.html"
)

#: Textkennzeichen (EF7U1) of Satzart 60 — what kind of municipality a row is.
KINDS = {
    "60": "Markt",
    "61": "Kreisfreie Stadt",
    "62": "Stadtkreis",
    "63": "Stadt",
    "64": "Kreisangehörige Gemeinde",
    "65": "Gemeindefreies Gebiet, bewohnt",
    "66": "Gemeindefreies Gebiet, unbewohnt",
    "67": "Große Kreisstadt",
}


def short_name(name: str) -> str:
    """'Kiel, Landeshauptstadt' -> 'Kiel'; 'Bergisch Gladbach, Stadt' -> 'Bergisch Gladbach'.

    In the register a comma only ever introduces a title ("Stadt",
    "Landeshauptstadt", "Hansestadt", "Universitätsstadt", ...). Parentheses,
    by contrast, are part of the name — "Halle (Saale)", "Frankfurt (Oder)" —
    and stay.
    """
    return name.split(",", 1)[0].strip()


def parse(text: str) -> dict:
    laender: dict[str, str] = {}
    kreise: dict[str, dict] = {}
    gemeinden: list[list] = []
    stand: str | None = None

    for line in text.splitlines():
        kind = line[0:2]
        if kind == "10":
            laender[line[10:12]] = line[22:72].strip()
        elif kind == "40":
            kreise[line[10:15]] = {
                "name": line[22:72].strip(),
                "seat": line[72:122].strip(),
                "kind": line[122:124].strip(),
            }
        elif kind == "60":
            stand = stand or f"{line[2:6]}-{line[6:8]}-{line[8:10]}"
            ags = line[10:18]
            name = line[22:72].strip()
            gemeinden.append(
                [
                    ags,
                    line[18:22],
                    name,
                    short_name(name),
                    line[122:124].strip(),
                    int(line[128:139] or 0),
                    int(line[139:150] or 0),
                    line[165:170].strip() or None,
                    bool(line[170:175].strip()),
                ]
            )

    return {
        "source": "Statistisches Bundesamt (Destatis), Gemeindeverzeichnis GV100AD",
        "stand": stand,
        "fields": [
            "ags",
            "verband",
            "name",
            "short_name",
            "kind",
            "area_ha",
            "population",
            "plz",
            "plz_multi",
        ],
        "kinds": KINDS,
        "laender": laender,
        "kreise": kreise,
        "gemeinden": gemeinden,
    }


def extract(zip_bytes: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        names = [
            n for n in archive.namelist() if n.upper().startswith("GV100AD") and n.lower().endswith(".txt")
        ]
        if not names:
            raise SystemExit(f"no GV100AD_*.txt in archive: {archive.namelist()}")
        return archive.read(names[0]).decode("utf-8")


async def download() -> bytes:
    async with build_client() as client:
        # The newest quarter is not known in advance; walk back from Q4 until
        # a page carries a zip. The robots.txt of destatis.de permits /DE/.
        for quarter in (4, 3, 2, 1):
            url = ARCHIVE.format(quarter=quarter)
            verdict = await robots.allowed(client, url)
            if not verdict.allowed:
                raise SystemExit(f"robots.txt forbids {url}")
            page = await client.get(url, timeout=30.0)
            if page.status_code != 200:
                continue
            match = re.search(r'href="([^"]*GV100AD\dQAktuell\.zip[^"]*)"', page.text)
            if not match:
                continue
            zip_url = match.group(1).replace("&amp;", "&")
            if zip_url.startswith("/"):
                zip_url = "https://www.destatis.de" + zip_url
            print(f"downloading {zip_url}", file=sys.stderr)
            response = await client.get(zip_url, timeout=120.0)
            response.raise_for_status()
            return response.content
    raise SystemExit("no GV100AD quarterly extract found")


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", help="use a downloaded GV100AD zip instead of fetching")
    parser.add_argument("--out", default=str(TARGET))
    args = parser.parse_args()

    payload = Path(args.zip).read_bytes() if args.zip else await download()
    data = parse(extract(payload))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))

    print(
        f"{len(data['gemeinden'])} Gemeinden, {len(data['kreise'])} Kreise, "
        f"{len(data['laender'])} Länder (Stand {data['stand']}) -> {out}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    asyncio.run(main())
