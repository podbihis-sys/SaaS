from __future__ import annotations

from app.models.enums import AuthorityType, Provider, ServiceCategory

#: Hand-maintained office catalogue.
#:
#: There is no national register of appointment systems in Germany — each state,
#: district and city procures its own — so the catalogue is curated rather than
#: crawled. Each entry pins the provider, the instance URL and the identifiers
#: that instance uses internally.
#:
#: ``verified`` records whether the entry's identifiers have been checked against
#: the live system. Unverified entries are seeded inactive so the scanner never
#: sends traffic to an endpoint nobody has confirmed.
CATALOG: list[dict] = [
    # ------------------------------------------------------------------ demo
    {
        "provider": Provider.DEMO,
        "external_id": "demo-buergeramt-mitte",
        "base_url": "https://demo.invalid",
        "name": "Bürgeramt Musterstadt Mitte",
        "authority_type": AuthorityType.BUERGERAMT,
        "street": "Rathausplatz 1",
        "postal_code": "10000",
        "city": "Musterstadt",
        "state": "Berlin",
        "latitude": 52.5200,
        "longitude": 13.4050,
        "booking_url": "https://demo.invalid/termine",
        "active": True,
        "verified": True,
    },
    {
        "provider": Provider.DEMO,
        "external_id": "demo-buergeramt-sued",
        "base_url": "https://demo.invalid",
        "name": "Bürgeramt Musterstadt Süd",
        "authority_type": AuthorityType.BUERGERAMT,
        "street": "Südallee 44",
        "postal_code": "10200",
        "city": "Musterstadt",
        "state": "Berlin",
        "latitude": 52.4780,
        "longitude": 13.4300,
        "booking_url": "https://demo.invalid/termine",
        "active": True,
        "verified": True,
    },
    {
        "provider": Provider.DEMO,
        "external_id": "demo-kfz-zulassung",
        "base_url": "https://demo.invalid",
        "name": "KFZ-Zulassungsstelle Musterstadt",
        "authority_type": AuthorityType.KFZ_ZULASSUNGSSTELLE,
        "street": "Industriestraße 7",
        "postal_code": "10300",
        "city": "Musterstadt",
        "state": "Berlin",
        "latitude": 52.5400,
        "longitude": 13.3600,
        "booking_url": "https://demo.invalid/termine",
        "active": True,
        "verified": True,
    },
    # ----------------------------------------------------------------- berlin
    # Berlin's ZMS ids come from the public URLs on service.berlin.de:
    # `dienstleister` for a branch, `dienstleistung` for an errand. They are
    # stable but must be re-checked whenever a branch is reorganised.
    {
        "provider": Provider.BERLIN_ZMS,
        "external_id": "122210",
        "base_url": "https://service.berlin.de",
        "name": "Bürgeramt Mitte (Rathaus Mitte)",
        "authority_type": AuthorityType.BUERGERAMT,
        "street": "Karl-Marx-Allee 31",
        "postal_code": "10178",
        "city": "Berlin",
        "state": "Berlin",
        "latitude": 52.5199,
        "longitude": 13.4265,
        "booking_url": "https://service.berlin.de/standort/122210/",
        "active": False,
        "verified": False,
        "provider_meta": {
            "services": [
                {"id": "120686", "name": "Anmeldung einer Wohnung", "duration_minutes": 15},
                {"id": "120703", "name": "Personalausweis beantragen", "duration_minutes": 15},
                {"id": "120926", "name": "Reisepass beantragen", "duration_minutes": 15},
                {"id": "121151", "name": "Führungszeugnis beantragen", "duration_minutes": 10},
            ]
        },
    },
    {
        "provider": Provider.BERLIN_ZMS,
        "external_id": "122217",
        "base_url": "https://service.berlin.de",
        "name": "Bürgeramt Friedrichshain-Kreuzberg",
        "authority_type": AuthorityType.BUERGERAMT,
        "street": "Frankfurter Allee 35-37",
        "postal_code": "10247",
        "city": "Berlin",
        "state": "Berlin",
        "latitude": 52.5150,
        "longitude": 13.4650,
        "booking_url": "https://service.berlin.de/standort/122217/",
        "active": False,
        "verified": False,
        "provider_meta": {
            "services": [
                {"id": "120686", "name": "Anmeldung einer Wohnung", "duration_minutes": 15},
                {"id": "120703", "name": "Personalausweis beantragen", "duration_minutes": 15},
            ]
        },
    },
    # ------------------------------------------------------------------ TEVIS
    {
        "provider": Provider.TEVIS,
        "external_id": "koeln-buergeramt",
        "base_url": "https://termine.stadt-koeln.de",
        "name": "Kundenzentrum Köln Innenstadt",
        "authority_type": AuthorityType.BUERGERAMT,
        "postal_code": "50667",
        "city": "Köln",
        "state": "Nordrhein-Westfalen",
        "latitude": 50.9375,
        "longitude": 6.9603,
        "active": False,
        "verified": False,
        "provider_meta": {"mandant": "1"},
    },
    # ------------------------------------------------------------- netAppoint
    {
        "provider": Provider.NETAPPOINT,
        "external_id": "kiel",
        "base_url": "https://termine.kiel.de",
        "name": "Bürger- und Ordnungsamt Kiel",
        "authority_type": AuthorityType.BUERGERAMT,
        "postal_code": "24103",
        "city": "Kiel",
        "state": "Schleswig-Holstein",
        "latitude": 54.3233,
        "longitude": 10.1394,
        "active": False,
        "verified": False,
        "provider_meta": {"company": "kiel"},
    },
]

#: Services attached to demo offices. Real providers discover their own.
DEMO_SERVICES: dict[str, list[tuple[str, str, ServiceCategory, int]]] = {
    "demo-buergeramt-mitte": [
        ("demo-anmeldung", "Anmeldung einer Wohnung", ServiceCategory.ANMELDUNG, 15),
        ("demo-perso", "Personalausweis beantragen", ServiceCategory.PERSONALAUSWEIS, 20),
        ("demo-pass", "Reisepass beantragen", ServiceCategory.REISEPASS, 20),
        ("demo-fz", "Führungszeugnis beantragen", ServiceCategory.FUEHRUNGSZEUGNIS, 10),
    ],
    "demo-buergeramt-sued": [
        ("demo-anmeldung", "Anmeldung einer Wohnung", ServiceCategory.ANMELDUNG, 15),
        ("demo-perso", "Personalausweis beantragen", ServiceCategory.PERSONALAUSWEIS, 20),
    ],
    "demo-kfz-zulassung": [
        ("demo-kfz", "Fahrzeug zulassen", ServiceCategory.KFZ_ZULASSUNG, 30),
    ],
}
