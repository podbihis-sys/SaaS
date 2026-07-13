---
description: Komplette Übersicht über Everything Claude Code (Skills, Commands, Agenten, Hooks, Regeln)
---

Zeige die KOMPLETTE in dieser Umgebung installierte ECC-Oberfläche an — nicht
nur ein Menü. Antworte auf Deutsch. Enumeriere dynamisch, was tatsächlich
verfügbar ist (erfinde nichts):

1. **Skills / Slash-Commands** — alle für den Skill-Aufruf verfügbaren
   Einträge aus der Skill-Liste dieser Session, gruppiert nach Zweck:
   Planen & Bauen · Review & Qualität · Build-Fixer · Sprach-Reviews & TDD ·
   Orchestrierung (orch-*, multi-*, gan-*, santa-loop) · Epics ·
   Lernen/Instinkte · Infrastruktur & Sonstiges. Jede Gruppe als kompakte
   Aufzählung der Befehle.
2. **Agenten** — alle verfügbaren Agententypen aus der Agent-Tool-Liste,
   gruppiert (Planung/Architektur, Review, Fixer, Testing, Spezialisten,
   Open-Source, GAN) als Tabelle.
3. **Hooks** — ob in diesem Projekt Hooks aktiv sind (`.claude/settings.json`
   prüfen) und welche die ECC-Regeln empfehlen
   (`.claude/rules/ecc/web/hooks.md`, `typescript/hooks.md`).
4. **Regeln** — installierte Regelpakete unter `.claude/rules/ecc/`
   (projektlokal) und `~/.claude/rules/ecc/` (global) auflisten.
5. Zum Schluss: 3–4 konkrete Empfehlungen, welche Befehle für den aktuellen
   Projektstand am nützlichsten sind.

Falls Argumente übergeben wurden, behandle sie stattdessen wie beim
`ecc-guide`-Skill (Themen-Lookup oder `find:`-Suche): $ARGUMENTS
