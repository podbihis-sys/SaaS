from __future__ import annotations

from enum import StrEnum


class Provider(StrEnum):
    """Booking system behind an office.

    Germany has no single appointment system. Each state, district and city
    picks its own vendor, so every one of these needs its own adapter.
    """

    DEMO = "demo"
    BERLIN_ZMS = "berlin_zms"
    TEVIS = "tevis"
    NETAPPOINT = "netappoint"
    ETERMIN = "etermin"
    #: A booking system we can link to but not read: either no adapter exists
    #: for that vendor, or the authority does not permit polling. The office is
    #: still worth listing — the user searches a postcode, finds the right
    #: authority and taps through to its own portal. Never scanned: entries
    #: carry ``scan_enabled=False``, and no adapter is registered for this key.
    PORTAL = "portal"


class ServiceCategory(StrEnum):
    """Normalised service taxonomy across offices.

    Every authority names its services differently ("Personalausweis
    beantragen", "Beantragung Personalausweis", "PA-Antrag"). Watches are
    created against these normalised categories so a user can watch the same
    errand across several cities at once.
    """

    ANMELDUNG = "anmeldung"
    ABMELDUNG = "abmeldung"
    UMMELDUNG = "ummeldung"
    PERSONALAUSWEIS = "personalausweis"
    REISEPASS = "reisepass"
    FUEHRUNGSZEUGNIS = "fuehrungszeugnis"
    MELDEBESCHEINIGUNG = "meldebescheinigung"
    KFZ_ZULASSUNG = "kfz_zulassung"
    KFZ_ABMELDUNG = "kfz_abmeldung"
    FUEHRERSCHEIN = "fuehrerschein"
    AUFENTHALTSTITEL = "aufenthaltstitel"
    VERPFLICHTUNGSERKLAERUNG = "verpflichtungserklaerung"
    EHESCHLIESSUNG = "eheschliessung"
    GEBURTSURKUNDE = "geburtsurkunde"
    GEWERBEANMELDUNG = "gewerbeanmeldung"
    BEGLAUBIGUNG = "beglaubigung"
    SONSTIGES = "sonstiges"


class AuthorityType(StrEnum):
    BUERGERAMT = "buergeramt"
    AUSLAENDERBEHOERDE = "auslaenderbehoerde"
    KFZ_ZULASSUNGSSTELLE = "kfz_zulassungsstelle"
    FUEHRERSCHEINSTELLE = "fuehrerscheinstelle"
    STANDESAMT = "standesamt"
    GEWERBEAMT = "gewerbeamt"
    JOBCENTER = "jobcenter"
    FINANZAMT = "finanzamt"
    SONSTIGES = "sonstiges"


class SlotStatus(StrEnum):
    #: Seen in the most recent successful scan.
    AVAILABLE = "available"
    #: Was available before but is missing from the latest scan.
    GONE = "gone"


class NotificationStatus(StrEnum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    #: Suppressed by the per-watch rate limit rather than a delivery problem.
    THROTTLED = "throttled"


class ScanStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class DevicePlatform(StrEnum):
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"


class BookingStatus(StrEnum):
    #: Handoff URL generated, user sent to the official portal.
    HANDED_OFF = "handed_off"
    #: User told us they completed the booking there.
    CONFIRMED = "confirmed"
    #: User told us the slot was gone by the time they arrived.
    MISSED = "missed"
    CANCELLED = "cancelled"
