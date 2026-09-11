"""Service labels vary wildly between authorities; the taxonomy absorbs that."""

from __future__ import annotations

import pytest

from app.models.enums import AuthorityType, ServiceCategory
from app.providers.taxonomy import classify_authority, classify_service


@pytest.mark.parametrize(
    ("label", "expected"),
    [
        ("Anmeldung einer Wohnung", ServiceCategory.ANMELDUNG),
        ("Wohnsitz anmelden", ServiceCategory.ANMELDUNG),
        ("Ummeldung innerhalb der Stadt", ServiceCategory.UMMELDUNG),
        ("Abmeldung einer Wohnung", ServiceCategory.ABMELDUNG),
        ("Personalausweis beantragen", ServiceCategory.PERSONALAUSWEIS),
        ("Beantragung eines Personalausweises", ServiceCategory.PERSONALAUSWEIS),
        ("Reisepass (Express)", ServiceCategory.REISEPASS),
        ("Kinderreisepass beantragen", ServiceCategory.REISEPASS),
        ("Führungszeugnis beantragen", ServiceCategory.FUEHRUNGSZEUGNIS),
        ("Fuehrungszeugnis", ServiceCategory.FUEHRUNGSZEUGNIS),
        ("Meldebescheinigung", ServiceCategory.MELDEBESCHEINIGUNG),
        ("Gewerbeanmeldung", ServiceCategory.GEWERBEANMELDUNG),
        ("Aufenthaltstitel verlängern", ServiceCategory.AUFENTHALTSTITEL),
        ("Verpflichtungserklärung", ServiceCategory.VERPFLICHTUNGSERKLAERUNG),
        ("Führerschein umtauschen", ServiceCategory.FUEHRERSCHEIN),
        ("Etwas völlig anderes", ServiceCategory.SONSTIGES),
    ],
)
def test_classify_service(label: str, expected: ServiceCategory) -> None:
    assert classify_service(label) == expected


def test_kfz_abmeldung_beats_generic_abmeldung() -> None:
    """Bare `Abmeldung` means moving out; with a vehicle it means deregistering a car."""
    assert classify_service("Abmeldung einer Wohnung") == ServiceCategory.ABMELDUNG
    assert classify_service("Fahrzeug abmelden") == ServiceCategory.KFZ_ABMELDUNG
    assert classify_service("KFZ Außerbetriebsetzung") == ServiceCategory.KFZ_ABMELDUNG


def test_kfz_zulassung_variants() -> None:
    assert classify_service("Fahrzeug zulassen") == ServiceCategory.KFZ_ZULASSUNG
    assert classify_service("KFZ-Zulassung") == ServiceCategory.KFZ_ZULASSUNG
    assert classify_service("Wiederzulassung eines Fahrzeugs") == ServiceCategory.KFZ_ZULASSUNG


@pytest.mark.parametrize(
    ("label", "expected"),
    [
        # Verbatim service names from service.bremen.de, the first state
        # catalogued. Real labels are the only honest test of a taxonomy.
        ("Wohnsitz als alleinige Wohnung oder Hauptwohnung anmelden", ServiceCategory.ANMELDUNG),
        ("Wohnsitz abmelden", ServiceCategory.ABMELDUNG),
        ("Personalausweis beantragen", ServiceCategory.PERSONALAUSWEIS),
        ("Reisepass beantragen", ServiceCategory.REISEPASS),
        ("Alten Führerschein in neuen Führerschein umtauschen", ServiceCategory.FUEHRERSCHEIN),
        ("Fahrerkarte beantragen", ServiceCategory.FUEHRERSCHEIN),
        ("Fahrerqualifizierungsnachweis", ServiceCategory.FUEHRERSCHEIN),
        ("100 km/h-Zulassung für Fahrzeuggespanne und Kraftomnibusse", ServiceCategory.KFZ_ZULASSUNG),
        ("Ausfuhrkennzeichen beantragen", ServiceCategory.KFZ_ZULASSUNG),
        ("E-Kennzeichen", ServiceCategory.KFZ_ZULASSUNG),
        ("Ab- bzw. Nachstempelung von Kfz-Kennzeichen", ServiceCategory.KFZ_ZULASSUNG),
        ("Feinstaubplakette beantragen", ServiceCategory.KFZ_ZULASSUNG),
        ("Auskunft aus dem Gewerbezentralregister beantragen", ServiceCategory.GEWERBEANMELDUNG),
        # Niche errands genuinely outside the taxonomy; "sonstiges" is the
        # honest answer rather than a forced fit.
        ("Einkommensteuererklärung einreichen", ServiceCategory.SONSTIGES),
        ("Beratung zu sexuell übertragbaren Infektionen (STI)", ServiceCategory.SONSTIGES),
    ],
)
def test_classify_real_bremen_labels(label: str, expected: ServiceCategory) -> None:
    assert classify_service(label) == expected


def test_verpflichtungserklaerung_beats_aufenthaltstitel() -> None:
    """Bremen titles it by its purpose, which names the broader category."""
    assert (
        classify_service("Verpflichtungserklärung beantragen (Zweck: Erteilung eines Aufenthaltstitels)")
        == ServiceCategory.VERPFLICHTUNGSERKLAERUNG
    )
    assert classify_service("Aufenthaltstitel verlängern") == ServiceCategory.AUFENTHALTSTITEL


def test_umlaut_folding_is_symmetric() -> None:
    """Authorities write the same word with and without umlauts, interchangeably."""
    assert classify_service("Führungszeugnis") == classify_service("Fuehrungszeugnis")
    assert classify_authority("Ausländerbehörde") == classify_authority("Auslaenderbehoerde")


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Bürgeramt Mitte", AuthorityType.BUERGERAMT),
        ("Bürgerbüro Nord", AuthorityType.BUERGERAMT),
        ("Kundenzentrum Innenstadt", AuthorityType.BUERGERAMT),
        ("Ausländerbehörde", AuthorityType.AUSLAENDERBEHOERDE),
        ("KFZ-Zulassungsstelle", AuthorityType.KFZ_ZULASSUNGSSTELLE),
        ("Standesamt Charlottenburg", AuthorityType.STANDESAMT),
        ("Jobcenter Nord", AuthorityType.JOBCENTER),
        ("Ein Ort ohne Hinweis", AuthorityType.SONSTIGES),
    ],
)
def test_classify_authority(name: str, expected: AuthorityType) -> None:
    assert classify_authority(name) == expected
