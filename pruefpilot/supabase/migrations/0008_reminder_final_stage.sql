-- Erinnerungsstufe "final": die letzte Info vor Fälligkeit, garantiert an einem Arbeitstag.
-- Liegt die Fälligkeit auf Wochenende/Feiertag, geht sie am letzten Arbeitstag davor raus.
alter table reminder_log drop constraint if exists reminder_log_stage_check;
alter table reminder_log
    add constraint reminder_log_stage_check
    check (stage in ('d60', 'd30', 'd7', 'final', 'overdue'));

-- Bundesland des Betriebs steuert die landesspezifischen Feiertage (NULL = nur bundesweite).
alter table companies
    add column if not exists bundesland text
    check (
        bundesland in (
            'BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV',
            'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'
        )
    );
