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
