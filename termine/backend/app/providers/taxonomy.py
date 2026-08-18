from __future__ import annotations

import re
import unicodedata

from app.models.enums import AuthorityType, ServiceCategory

#: Ordered because German service labels overlap heavily: "Personalausweis und
#: Reisepass beantragen" must not be classified twice, and "Abmeldung eines
#: Fahrzeugs" is a KFZ errand, not a residence one. First match wins, so the
#: more specific patterns come first.
#: A vehicle word, in any of the spellings authorities use.
_VEHICLE = r"fahrzeug|kfz|kraftfahrzeug|auto|motorrad|anhaenger|roller"

_CATEGORY_PATTERNS: list[tuple[ServiceCategory, str]] = [
    # Lookaheads rather than `A.*B`, because German puts the words in either
    # order: "Fahrzeug abmelden" and "Abmeldung eines Fahrzeugs" are the same
    # errand.
    (ServiceCategory.KFZ_ABMELDUNG, rf"(?=.*({_VEHICLE}))(?=.*(abmeld|ausserbetrieb|stilllegung))"),
    (ServiceCategory.KFZ_ZULASSUNG, rf"(?=.*({_VEHICLE}))(?=.*(zulass|anmeld|ummeld))"),
    (ServiceCategory.KFZ_ZULASSUNG, r"\bkfz[- ]?zulassung\b|zulassungsstelle"),
    (ServiceCategory.FUEHRERSCHEIN, r"f(ue|ü)hrerschein|fahrerlaubnis"),
    (ServiceCategory.FUEHRUNGSZEUGNIS, r"f(ue|ü)hrungszeugnis"),
    (ServiceCategory.AUFENTHALTSTITEL, r"aufenthalt|niederlassungserlaubnis|blaue karte|blue card|visum"),
    (ServiceCategory.VERPFLICHTUNGSERKLAERUNG, r"verpflichtungserkl"),
    (ServiceCategory.EHESCHLIESSUNG, r"ehe|heirat|lebenspartnerschaft|trauung"),
    (ServiceCategory.GEBURTSURKUNDE, r"geburtsurkunde|geburtsbeurkundung|sterbeurkunde|urkunde"),
    (ServiceCategory.GEWERBEANMELDUNG, r"gewerbe"),
    (ServiceCategory.MELDEBESCHEINIGUNG, r"meldebescheinigung|melderegisterauskunft"),
    (ServiceCategory.BEGLAUBIGUNG, r"beglaubig"),
    (ServiceCategory.PERSONALAUSWEIS, r"personalausweis|\bpa\b|identit(ae|ä)tskarte"),
    (ServiceCategory.REISEPASS, r"reisepass|\bpass\b|kinderreisepass|expresspass"),
    # Residence registration variants. "Anmeldung" alone is ambiguous across
    # authorities, so it is matched last among the Meldewesen patterns.
    (ServiceCategory.UMMELDUNG, r"ummeld|wohnungswechsel|umzug"),
    (ServiceCategory.ABMELDUNG, r"abmeld"),
    (ServiceCategory.ANMELDUNG, r"anmeld|wohnsitz|wohnung.*(anmeld|meld)"),
]

_AUTHORITY_PATTERNS: list[tuple[AuthorityType, str]] = [
    (AuthorityType.AUSLAENDERBEHOERDE, r"ausl(ae|ä)nder|migration|einwanderung|immigration"),
    (AuthorityType.KFZ_ZULASSUNGSSTELLE, r"zulassungsstelle|kfz"),
    (AuthorityType.FUEHRERSCHEINSTELLE, r"f(ue|ü)hrerscheinstelle"),
    (AuthorityType.STANDESAMT, r"standesamt"),
    (AuthorityType.GEWERBEAMT, r"gewerbeamt|gewerbemeldestelle"),
    (AuthorityType.JOBCENTER, r"jobcenter|arbeitsagentur|agentur f(ue|ü)r arbeit"),
    (AuthorityType.FINANZAMT, r"finanzamt"),
    (AuthorityType.BUERGERAMT, r"b(ue|ü)rgeramt|b(ue|ü)rgerb(ue|ü)ro|b(ue|ü)rgerservice|rathaus|einwohnermelde|kundenzentrum|stadtb(ue|ü)ro"),
]


def _normalise(text: str) -> str:
    """Lowercase, strip accents, collapse whitespace.

    Umlauts are folded to their ASCII pairs (ä -> ae) rather than dropped, so
    "Ausländerbehörde" and "Auslaenderbehoerde" both match one pattern.
    """
    lowered = text.lower().strip()
    lowered = (
        lowered.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    )
    decomposed = unicodedata.normalize("NFKD", lowered)
    ascii_only = "".join(c for c in decomposed if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", ascii_only)


def classify_service(name: str) -> ServiceCategory:
    """Map an authority's free-text service label onto our taxonomy."""
    text = _normalise(name)
    for category, pattern in _CATEGORY_PATTERNS:
        if re.search(pattern, text):
            return category
    return ServiceCategory.SONSTIGES


def classify_authority(name: str) -> AuthorityType:
    """Guess the kind of authority from an office name."""
    text = _normalise(name)
    for authority, pattern in _AUTHORITY_PATTERNS:
        if re.search(pattern, text):
            return authority
    return AuthorityType.SONSTIGES


#: Human labels used in push notifications and as fallback UI copy.
CATEGORY_LABELS_DE: dict[ServiceCategory, str] = {
    ServiceCategory.ANMELDUNG: "Wohnsitz anmelden",
    ServiceCategory.ABMELDUNG: "Wohnsitz abmelden",
    ServiceCategory.UMMELDUNG: "Wohnsitz ummelden",
    ServiceCategory.PERSONALAUSWEIS: "Personalausweis",
    ServiceCategory.REISEPASS: "Reisepass",
    ServiceCategory.FUEHRUNGSZEUGNIS: "Führungszeugnis",
    ServiceCategory.MELDEBESCHEINIGUNG: "Meldebescheinigung",
    ServiceCategory.KFZ_ZULASSUNG: "KFZ-Zulassung",
    ServiceCategory.KFZ_ABMELDUNG: "KFZ-Abmeldung",
    ServiceCategory.FUEHRERSCHEIN: "Führerschein",
    ServiceCategory.AUFENTHALTSTITEL: "Aufenthaltstitel",
    ServiceCategory.VERPFLICHTUNGSERKLAERUNG: "Verpflichtungserklärung",
    ServiceCategory.EHESCHLIESSUNG: "Eheschließung",
    ServiceCategory.GEBURTSURKUNDE: "Urkunden",
    ServiceCategory.GEWERBEANMELDUNG: "Gewerbeanmeldung",
    ServiceCategory.BEGLAUBIGUNG: "Beglaubigung",
    ServiceCategory.SONSTIGES: "Sonstiges",
}
