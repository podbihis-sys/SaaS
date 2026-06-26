/**
 * Blog-Inhalte. Die Volltexte stammen 1:1 von der bestehenden Website
 * natuerlichgruen.net und wurden in eine strukturierte Form überführt
 * (saubere H2/H3-Hierarchie für SEO und Barrierefreiheit).
 *
 * Migrationshinweis: Für eine redaktionelle Pflege durch den Kunden kann
 * dieses Modul später gegen ein Headless-CMS (z. B. Sanity, Contentful)
 * oder MDX-Dateien ausgetauscht werden – die Komponenten bleiben gleich.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  date: string; // ISO
  blocks: Block[];
};

const ctaBlocks = (
  question: string,
  statement: string,
): Block[] => [
  { type: "p", text: question },
  { type: "p", text: statement },
];

export const posts: BlogPost[] = [
  {
    slug: "pflege-im-naturgarten",
    title: "Pflege im Naturgarten – Weniger ist mehr",
    subtitle: "Warum weniger oft mehr ist",
    excerpt:
      "Viele Probleme im Garten entstehen nicht dadurch, dass zu wenig gemacht wird – sondern dadurch, dass dauerhaft zu viel eingegriffen wird.",
    metaTitle: "Pflege im Naturgarten – Weniger ist mehr | natürlich grün",
    metaDescription:
      "Warum im Naturgarten weniger oft mehr ist: sinnvolle Pflege bedeutet beobachten, verstehen und gezielt eingreifen. Praxiswissen aus Bad Münstereifel, Mechernich & Euskirchen.",
    date: "2025-04-15",
    blocks: [
      {
        type: "p",
        text: "Wenn Menschen an Gartenpflege denken, entsteht häufig das Bild von ständigem Schneiden, Aufräumen und Eingreifen. In unserer täglichen Arbeit erleben wir jedoch oft das Gegenteil: Viele Probleme entstehen nicht dadurch, dass zu wenig gemacht wird – sondern dadurch, dass dauerhaft zu viel eingegriffen wird.",
      },
      {
        type: "p",
        text: "Ein naturnaher Garten funktioniert anders. Er lebt davon, dass sich Strukturen entwickeln dürfen und nicht ständig korrigiert werden. Gerade seit den letzten Jahren beobachten wir, dass viele Menschen sich wieder stärker natürliche und ruhigere Gärten wünschen. Gleichzeitig merken wir aber auch, dass klassische Vorstellungen von „Ordnung“ im Garten oft im Widerspruch zu einem stabilen Naturgarten stehen.",
      },
      { type: "h2", text: "Pflege bedeutet nicht Kontrolle" },
      {
        type: "p",
        text: "Ich erlebe immer wieder, dass Gärten unter einem hohen „Pflegedruck“ stehen. Alles soll ordentlich aussehen, sofort funktionieren und möglichst jederzeit kontrollierbar bleiben. Genau dadurch entsteht häufig Unruhe:",
      },
      {
        type: "ul",
        items: [
          "Pflanzen werden ständig zurückgeschnitten",
          "Böden dauerhaft bearbeitet",
          "natürliche Entwicklungen unterbrochen",
          "Flächen regelmäßig „sauber“ gemacht",
          "spontane Entwicklungen sofort entfernt",
        ],
      },
      {
        type: "p",
        text: "Ein Garten wird dadurch oft nicht stabiler – sondern empfindlicher. Gerade im Frühjahr beobachten wir häufig, dass zu früh und zu intensiv eingegriffen wird. Dabei befinden sich viele Pflanzen und Bodenorganismen erst am Beginn ihrer aktiven Phase.",
      },
      { type: "h2", text: "Warum viele Gärten dauerhaft „unruhig“ wirken" },
      {
        type: "p",
        text: "In unserer täglichen Arbeit rund um Bad Münstereifel, Mechernich und Euskirchen sehen wir oft Gärten, die technisch gepflegt wirken – aber trotzdem keine Ruhe ausstrahlen. Aus unserer Sicht liegt das häufig daran, dass:",
      },
      {
        type: "ul",
        items: [
          "Pflanzen nicht richtig eingewachsen sind",
          "ständig umgestaltet wird",
          "natürliche Abläufe unterbrochen werden",
          "zu viele Eingriffe gleichzeitig stattfinden",
        ],
      },
      {
        type: "p",
        text: "Der Garten bekommt dadurch keine Möglichkeit, eigene Stabilität zu entwickeln. Ein naturnaher Garten funktioniert langfristig nicht über permanente Korrektur, sondern über Entwicklung.",
      },
      { type: "h2", text: "Was wir unter sinnvoller Pflege verstehen" },
      {
        type: "p",
        text: "Pflege bedeutet für uns nicht, möglichst viel zu machen. Pflege bedeutet: beobachten, verstehen, gezielt eingreifen. Gerade im Naturgarten ist Zurückhaltung oft der entscheidende Faktor. Viele Bereiche entwickeln sich stabiler, wenn:",
      },
      {
        type: "ul",
        items: [
          "Pflanzen Zeit bekommen",
          "Böden möglichst wenig gestört werden",
          "natürliche Abläufe zugelassen werden",
          "abgestimmte Pflege statt ständiger Eingriffe erfolgt",
        ],
      },
      {
        type: "p",
        text: "Das bedeutet nicht, den Garten sich selbst zu überlassen. Aber es bedeutet, Eingriffe bewusster zu setzen und den richtigen Zeitpunkt dafür zu wählen.",
      },
      {
        type: "h2",
        text: "Der Boden spielt eine größere Rolle, als viele denken",
      },
      {
        type: "p",
        text: "Ein Punkt, den wir in der Praxis immer wieder beobachten: Viele Pflegeprobleme entstehen eigentlich im Boden. Wird der Boden zu häufig bearbeitet, dauerhaft verdichtet, ständig offen gelassen oder biologisch gestört, wirkt sich das langfristig auf den gesamten Garten aus. Pflanzen werden empfindlicher, Wasser versickert schlechter und die natürliche Stabilität nimmt ab. Deshalb gehört für uns zur Pflege nicht nur der sichtbare Bereich des Gartens – sondern immer auch der Umgang mit dem Boden.",
      },
      { type: "h2", text: "Typische Fehler, die wir häufig sehen" },
      {
        type: "ul",
        items: [
          "zu häufiges Mähen",
          "radikaler Rückschnitt",
          "übermäßige Bodenbearbeitung",
          "ständiges Austauschen von Pflanzen",
          "großflächiges Entfernen natürlicher Strukturen",
          "falscher Zeitpunkt für Pflegearbeiten",
        ],
      },
      {
        type: "p",
        text: "Viele dieser Maßnahmen entstehen aus dem Wunsch heraus, den Garten „in Ordnung“ zu halten. Langfristig schwächen sie jedoch oft die Stabilität des Gartens. Gerade in trockenen oder heißen Jahren zeigen sich diese Probleme besonders deutlich.",
      },
      { type: "h2", text: "Pflege im Naturgarten mit natürlich grün" },
      {
        type: "p",
        text: "Wir von natürlich grün begleiten Menschen dabei, ihre Gärten langfristig und standortgerecht zu entwickeln. Gerade bei der Pflege zeigt sich, wie wichtig Erfahrung, Ruhe und ein gutes Verständnis für natürliche Prozesse sind. Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir bis nach Euskirchen – und auf Wunsch sowie nach Absprache auch darüber hinaus.",
      },
      ...ctaBlocks(
        "Möchten Sie Ihren Garten langfristig pflegeleichter und stabiler entwickeln?",
        "Gerne unterstützen wir Sie bei der Planung, Pflege und Weiterentwicklung Ihres Gartens.",
      ),
    ],
  },
  {
    slug: "pflanzenauswahl-im-naturgarten",
    title:
      "Pflanzenauswahl im Naturgarten – Warum standortgerechte Pflanzen entscheidend sind",
    subtitle: "Nachhaltig und lebendig",
    excerpt:
      "Gärten werden oft nicht deshalb problematisch, weil sie schlecht gepflegt sind – sondern weil die Pflanzen von Anfang an nicht zum Standort passen.",
    metaTitle:
      "Pflanzenauswahl im Naturgarten – standortgerecht pflanzen | natürlich grün",
    metaDescription:
      "Warum standortgerechte Pflanzen im Naturgarten langfristig entscheidend sind. Heimische Arten für stabile, pflegeleichte Gärten in der Region Bad Münstereifel & Euskirchen.",
    date: "2025-04-02",
    blocks: [
      {
        type: "p",
        text: "Wenn wir über nachhaltige Gartengestaltung sprechen, wird oft zuerst über Gestaltung, Materialien oder Pflege gesprochen. Aus unserer Sicht liegt einer der wichtigsten Faktoren jedoch an einer ganz anderen Stelle: bei der Auswahl der Pflanzen.",
      },
      {
        type: "p",
        text: "Ich erlebe in unserer täglichen Arbeit immer wieder, dass Gärten nicht deshalb problematisch werden, weil sie schlecht gepflegt sind – sondern weil die Pflanzen von Anfang an nicht zum Standort passen.",
      },
      { type: "h2", text: "Unsere Erfahrung aus der Praxis" },
      {
        type: "p",
        text: "Wir arbeiten von unserer Heimat in Bad Münstereifel aus bis nach Mechernich und Euskirchen – und auf Wunsch auch darüber hinaus. In dieser Region sehen wir sehr unterschiedliche Voraussetzungen:",
      },
      {
        type: "ul",
        items: [
          "schwere, lehmige Böden",
          "sandige, trockene Bereiche",
          "schattige Lagen im Tal",
          "sonnige, exponierte Flächen",
        ],
      },
      {
        type: "p",
        text: "Und genau hier zeigt sich, wie entscheidend die Pflanzenauswahl ist. Ein Garten funktioniert langfristig nur dann gut, wenn die Pflanzen mit diesen Bedingungen zurechtkommen – nicht dagegen arbeiten müssen.",
      },
      { type: "h2", text: "Warum viele Pflanzkonzepte nicht funktionieren" },
      {
        type: "p",
        text: "Ein häufiger Fehler ist es, Pflanzen nach Optik oder kurzfristigem Eindruck auszuwählen. Das führt oft dazu, dass:",
      },
      {
        type: "ul",
        items: [
          "Pflanzen regelmäßig ersetzt werden müssen",
          "hoher Wasserbedarf entsteht",
          "Krankheiten und Schwächen zunehmen",
          "der Pflegeaufwand dauerhaft steigt",
        ],
      },
      {
        type: "p",
        text: "In unserer Arbeit sehen wir genau diese Situationen immer wieder. Der Garten wirkt dann nie wirklich stabil – sondern eher wie ein System, das ständig „nachjustiert“ werden muss.",
      },
      { type: "h2", text: "Unser Ansatz: Pflanzen vom Standort her denken" },
      {
        type: "p",
        text: "Für uns beginnt Pflanzenauswahl nicht mit der Frage „Was gefällt?“. Sondern mit: „Was funktioniert hier langfristig?“ Grundlage dafür sind Bodenbeschaffenheit, Wasserverfügbarkeit, Lichtverhältnisse und Mikroklima. Auf dieser Grundlage wählen wir Pflanzen aus, die sich natürlich entwickeln können.",
      },
      { type: "h2", text: "Heimische und standortgerechte Pflanzen" },
      {
        type: "p",
        text: "In vielen Fällen sind heimische oder angepasste Pflanzen die bessere Wahl. Nicht aus ideologischen Gründen – sondern weil sie mit den vorhandenen Bedingungen besser umgehen können. Das bedeutet für den Garten:",
      },
      {
        type: "ul",
        items: [
          "stabilere Entwicklung",
          "geringerer Pflegeaufwand",
          "weniger Ausfälle",
          "mehr Lebensraum für Tiere",
        ],
      },
      {
        type: "p",
        text: "Ich sehe immer wieder, wie sich Gärten verändern, wenn die Pflanzenauswahl stimmt. Sie wirken ruhiger, stimmiger – und entwickeln sich mit der Zeit weiter, statt ständig korrigiert werden zu müssen.",
      },
      { type: "h2", text: "Pflanzenauswahl mit natürlich grün" },
      {
        type: "p",
        text: "Wir von natürlich grün begleiten Menschen dabei, Gärten langfristig zu entwickeln – nicht nur kurzfristig zu gestalten. Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir bis nach Euskirchen – und auf Wunsch sowie nach Absprache auch darüber hinaus.",
      },
      ...ctaBlocks(
        "Möchten Sie wissen, welche Pflanzen in Ihrem Garten langfristig wirklich funktionieren?",
        "Gerne unterstützen wir Sie bei der Auswahl und Planung.",
      ),
    ],
  },
  {
    slug: "typische-fruehjahrsarbeiten-im-naturgarten",
    title: "Typische Frühjahrsarbeiten im Naturgarten",
    subtitle: "Was jetzt sinnvoll ist – und was besser noch warten sollte",
    excerpt:
      "Mit dem März beginnt die aktivere Phase des Gartenjahres. Ein naturnaher Garten profitiert davon, wenn Arbeiten zum richtigen Zeitpunkt und mit Zurückhaltung erfolgen.",
    metaTitle:
      "Typische Frühjahrsarbeiten im Naturgarten | natürlich grün",
    metaDescription:
      "Frühjahrsarbeiten im Naturgarten: Was im März sinnvoll ist und was besser warten sollte. Rückschnitt, Bodenarbeiten und erste Pflanzungen mit Bedacht.",
    date: "2025-03-10",
    blocks: [
      {
        type: "p",
        text: "Mit dem März beginnt für viele Gärten die aktivere Phase des Jahres. Die Tage werden länger, die Temperaturen steigen langsam, und erste Pflanzen zeigen neue Triebe. In dieser Zeit wächst oft auch die Motivation, im Garten wieder aktiv zu werden. Gleichzeitig erleben wir immer wieder, dass gerade im frühen Frühjahr viele Maßnahmen zu schnell umgesetzt werden. Ein naturnaher Garten profitiert jedoch davon, wenn Arbeiten zum richtigen Zeitpunkt und mit Zurückhaltung erfolgen.",
      },
      { type: "h2", text: "Frühling bedeutet nicht sofort eingreifen" },
      {
        type: "p",
        text: "Wenn die ersten warmen Tage kommen, entsteht schnell das Gefühl, der Garten müsse jetzt „aufgeräumt“ werden. Doch gerade im Naturgarten gilt: Viele Strukturen erfüllen wichtige Funktionen. Laubschichten, abgestorbene Stauden und kleine Totholzbereiche sind nicht nur Überreste des Winters, sondern auch Lebensräume für zahlreiche Tiere. Deshalb entfernen wir solche Strukturen nicht pauschal, sondern prüfen zuerst:",
      },
      {
        type: "ul",
        items: [
          "Welche Bereiche sind wichtige Rückzugsorte für Tiere?",
          "Wo entstehen neue Pflanzentriebe?",
          "Welche Strukturen können noch bestehen bleiben?",
        ],
      },
      {
        type: "p",
        text: "Ein Garten, der sich entwickeln darf, wirkt im Frühjahr vielleicht weniger „aufgeräumt“, dafür aber deutlich lebendiger.",
      },
      { type: "h2", text: "Der richtige Zeitpunkt für den Rückschnitt" },
      {
        type: "p",
        text: "Viele Gehölze und Stauden können im Frühjahr zurückgeschnitten werden – allerdings nicht alle gleichzeitig. Sinnvoll sind im März:",
      },
      {
        type: "ul",
        items: [
          "vorsichtiges Zurückschneiden abgestorbener Staudenreste",
          "Entfernen beschädigter Triebe an Gehölzen",
          "leichte Formkorrekturen bei Sträuchern",
        ],
      },
      {
        type: "p",
        text: "Dabei achten wir darauf, junge Triebe nicht zu beschädigen und vorhandene Strukturen möglichst zu erhalten.",
      },
      { type: "h2", text: "Bodenarbeiten nur mit Bedacht" },
      {
        type: "p",
        text: "Ein häufiger Fehler im Frühjahr ist eine zu frühe Bodenbearbeitung. Wenn der Boden noch sehr feucht ist, kann jede Bearbeitung seine Struktur verschlechtern. Sinnvoll sind stattdessen:",
      },
      {
        type: "ul",
        items: [
          "lockeres Auflockern stark verdichteter Bereiche",
          "vorsichtiges Entfernen von unerwünschten Aufwüchsen",
          "Ergänzen von organischem Material",
        ],
      },
      { type: "h2", text: "Erste Pflanzungen im Frühjahr" },
      {
        type: "p",
        text: "Der März kann – je nach Wetter und Boden – bereits ein guter Zeitpunkt für erste Pflanzungen sein. Besonders robuste Stauden und Gehölze kommen mit den wechselhaften Bedingungen gut zurecht. Wichtig ist dabei:",
      },
      {
        type: "ul",
        items: [
          "Pflanzen passend zum Standort auswählen",
          "ausreichend Platz für Entwicklung einplanen",
          "den Boden nicht unnötig stark verändern",
        ],
      },
      { type: "h2", text: "Geduld bleibt der wichtigste Faktor" },
      {
        type: "p",
        text: "Auch wenn der März der Beginn der Gartensaison ist, bleibt Geduld ein entscheidender Faktor. Viele Prozesse im Garten brauchen Zeit – und lassen sich nicht beschleunigen.",
      },
      { type: "h2", text: "Frühjahrsarbeiten mit natürlich grün" },
      {
        type: "p",
        text: "Wir von natürlich grün begleiten Menschen dabei, ihre Gärten langfristig und standortgerecht zu entwickeln. Gerade im Frühjahr zeigt sich, wie wichtig eine ruhige und durchdachte Herangehensweise ist. Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir bis nach Euskirchen – und auf Wunsch und nach Absprache auch darüber hinaus.",
      },
      ...ctaBlocks(
        "Möchten Sie wissen, welche Frühjahrsarbeiten in Ihrem Garten wirklich sinnvoll sind?",
        "Gerne unterstützen wir Sie bei der Planung und Entwicklung Ihres Gartens.",
      ),
    ],
  },
  {
    slug: "naturnaher-garten-was-jetzt-sinnvoll-ist",
    title: "Naturnaher Garten – Was jetzt wirklich sinnvoll ist",
    subtitle: "Was jetzt wirklich sinnvoll ist – und was nicht",
    excerpt:
      "Der Februar ist im Garten eine besondere Zeit. Ein naturnaher Garten braucht zu dieser Jahreszeit vor allem eines: Geduld und Aufmerksamkeit.",
    metaTitle:
      "Naturnaher Garten im Februar – was jetzt sinnvoll ist | natürlich grün",
    metaDescription:
      "Naturnaher Garten im Februar: Warum Zurückhaltung sinnvoll ist, was jetzt wirklich getan werden sollte und warum Planung wichtiger ist als Umsetzung.",
    date: "2025-02-12",
    blocks: [
      {
        type: "p",
        text: "Der Februar ist im Garten eine besondere Zeit. Noch wirkt vieles ruhig, manchmal sogar leblos. Und doch beginnt genau jetzt die Phase, in der wichtige Entscheidungen getroffen werden. In unserer täglichen Arbeit erleben wir, dass der Wunsch groß ist, im Frühjahr möglichst schnell „loszulegen“. Gleichzeitig entstehen gerade durch übereiltes Handeln viele Probleme, die den Garten das ganze Jahr begleiten. Ein naturnaher Garten braucht zu dieser Jahreszeit vor allem eines: Geduld und Aufmerksamkeit.",
      },
      {
        type: "p",
        text: "Unser Ansatz ist es deshalb, im Februar nicht zu gestalten, sondern zuerst zu verstehen.",
      },
      {
        type: "h2",
        text: "Unsere Heimat prägt auch den Start ins Gartenjahr",
      },
      {
        type: "p",
        text: "Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir in der Region bis nach Mechernich und Euskirchen – und auf Wunsch sowie nach Absprache auch darüber hinaus. Gerade in unserer Region zeigt sich das Frühjahr sehr unterschiedlich: je nach Höhenlage, Boden und Exposition beginnt die Vegetation früher oder später. Deshalb gibt es für uns keinen festen „Starttermin“, sondern nur einen richtigen Zeitpunkt für den jeweiligen Standort.",
      },
      { type: "h2", text: "Warum im Februar Zurückhaltung sinnvoll ist" },
      {
        type: "p",
        text: "Der Boden ist oft noch kalt und feucht. Pflanzen befinden sich in der Winterruhe oder beginnen gerade erst, wieder aktiv zu werden. Eingriffe zur falschen Zeit können mehr schaden als nutzen. Dazu gehören:",
      },
      {
        type: "ul",
        items: [
          "starkes Zurückschneiden ohne Not",
          "Bodenbearbeitung bei Nässe",
          "vorschnelle Pflanzungen",
        ],
      },
      {
        type: "p",
        text: "Ein naturnaher Garten profitiert davon, wenn natürliche Prozesse respektiert werden – auch wenn es manchmal schwerfällt, nichts zu tun.",
      },
      { type: "h3", text: "Beobachten statt eingreifen" },
      {
        type: "p",
        text: "Der Februar ist für uns vor allem ein Monat des Beobachtens. Jetzt zeigt sich, wie der Garten den Winter überstanden hat: Staunässe oder trockene Bereiche, Frostschäden an Gehölzen sowie vorhandene Strukturen wie Laub, Totholz oder Staudenreste. Diese Beobachtungen bilden die Grundlage für alle weiteren Schritte im Frühjahr.",
      },
      { type: "h3", text: "Erste sinnvolle Maßnahmen im Naturgarten" },
      {
        type: "p",
        text: "Ganz ohne Arbeit kommt der Februar natürlich nicht aus. Es gibt einige Tätigkeiten, die jetzt sinnvoll und hilfreich sind:",
      },
      {
        type: "ul",
        items: [
          "lockeres Entfernen von beschädigten Pflanzenteilen",
          "Überprüfen von Gehölzen auf Bruchschäden",
          "zurückhaltende Pflege, ohne Strukturen zu zerstören",
        ],
      },
      {
        type: "p",
        text: "Besonders wichtig ist uns, Überwinterungsplätze für Tiere zu erhalten. Abgestorbene Stauden, Laubschichten und natürliche Ecken sind keine Unordnung, sondern wertvolle Lebensräume.",
      },
      { type: "h3", text: "Planung ist jetzt wichtiger als Umsetzung" },
      {
        type: "p",
        text: "Während im Garten noch Ruhe herrscht, ist der Februar ideal für Planung. Jetzt lassen sich Konzepte entwickeln, ohne unter Zeitdruck zu stehen: Wo soll sich der Garten weiterentwickeln? Welche Bereiche brauchen langfristig Veränderung? Wo ist weniger Eingriff sinnvoller als mehr? Eine gute Planung im Winter und Frühjahr spart später viel Aufwand und sorgt für einen ruhigeren Saisonverlauf.",
      },
      { type: "h2", text: "Frühjahr im Naturgarten heißt nicht: alles neu" },
      {
        type: "p",
        text: "Ein naturnaher Garten lebt davon, dass er sich entwickelt. Das Frühjahr ist kein Neustart auf leerer Fläche, sondern ein Weiterarbeiten mit dem, was bereits da ist. Gerade im Februar zeigt sich, wie wertvoll vorhandene Strukturen sind – und wo der Garten Unterstützung braucht, statt Veränderung um der Veränderung willen.",
      },
      { type: "h2", text: "Naturnahe Gartengestaltung mit natürlich grün" },
      {
        type: "p",
        text: "Wir von natürlich grün begleiten Menschen dabei, ihre Gärten langfristig und standortgerecht zu entwickeln. Unsere Arbeit beginnt nicht mit schnellen Lösungen, sondern mit einem Blick für das Wesentliche. Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir bis nach Euskirchen – und auf Wunsch und nach Absprache auch darüber hinaus.",
      },
      ...ctaBlocks(
        "Möchten Sie wissen, welche Schritte in Ihrem Garten im Frühjahr wirklich sinnvoll sind?",
        "Gerne begleiten wir Sie von der ersten Einschätzung bis zur langfristigen Entwicklung.",
      ),
    ],
  },
  {
    slug: "nachhaltige-gartengestaltung-region-euskirchen",
    title: "Nachhaltige Gartengestaltung in unserer Region",
    subtitle: "Boden, Pflanzen & Planung als Grundlage",
    excerpt:
      "Nachhaltige Gartengestaltung beginnt nicht mit der Pflanze und nicht mit dem ersten Spatenstich. Sie beginnt mit dem Verstehen des Ortes.",
    metaTitle:
      "Nachhaltige Gartengestaltung in der Region Euskirchen | natürlich grün",
    metaDescription:
      "Nachhaltige Gartengestaltung in der Region Euskirchen: Boden, Pflanzen und Planung als Grundlage. Gärten, die mit dem Standort arbeiten – nicht gegen ihn.",
    date: "2025-01-20",
    blocks: [
      {
        type: "p",
        text: "Nachhaltige Gartengestaltung beginnt für uns nicht mit der Pflanze und auch nicht mit dem ersten Spatenstich. Sie beginnt mit dem Verstehen des Ortes. In unserer täglichen Arbeit sehen wir, dass viele Gärten nach ähnlichen Mustern angelegt werden – unabhängig von Boden, Lage oder Klima. Genau hier entstehen langfristig Probleme: hoher Pflegeaufwand, schwache Pflanzen und ein Garten, der ständig „korrigiert“ werden muss.",
      },
      {
        type: "p",
        text: "Unser Ansatz ist ein anderer. Wir gestalten Gärten so, dass sie mit dem Standort arbeiten – nicht gegen ihn.",
      },
      { type: "h2", text: "Unsere Heimat als Ausgangspunkt der Planung" },
      {
        type: "p",
        text: "Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir in der Region bis nach Mechernich und Euskirchen – und auf Wunsch sowie nach Absprache auch darüber hinaus. Gerade diese Region zeigt, wie unterschiedlich die Voraussetzungen sein können: unterschiedliche Böden, Höhenlagen, Sonneneinstrahlung und Wasserverfügbarkeit. Nachhaltige Gartengestaltung bedeutet für uns deshalb immer, regional zu denken.",
      },
      { type: "h2", text: "Warum der Boden die wichtigste Grundlage ist" },
      {
        type: "p",
        text: "Der Boden ist das Fundament jedes Gartens. Trotzdem wird er häufig übersehen oder mit standardisierten Lösungen „verbessert“, die langfristig mehr schaden als nutzen. Am Anfang steht für uns deshalb die Frage: Welche Bodenart liegt vor? Wie ist die Durchlässigkeit? Wie lebendig ist der Boden bereits? Ein gesunder Boden:",
      },
      {
        type: "ul",
        items: [
          "speichert Wasser besser",
          "versorgt Pflanzen gleichmäßiger",
          "reduziert den Pflegeaufwand deutlich",
        ],
      },
      {
        type: "p",
        text: "Statt den Boden auszutauschen oder künstlich zu verändern, arbeiten wir daran, ihn schrittweise aufzubauen und zu stabilisieren.",
      },
      { type: "h2", text: "Pflanzenwahl: angepasst statt austauschbar" },
      {
        type: "p",
        text: "Nachhaltige Gartengestaltung bedeutet für uns nicht, möglichst viele Pflanzen einzusetzen, sondern die richtigen. Wir bevorzugen:",
      },
      {
        type: "ul",
        items: [
          "heimische und standortgerechte Arten",
          "robuste Stauden und Gehölze",
          "Pflanzen, die mit den vorhandenen Bedingungen zurechtkommen",
        ],
      },
      {
        type: "p",
        text: "Das hat mehrere Vorteile: geringerer Wasserbedarf, weniger Ausfälle und mehr Lebensraum für Tiere. Ein Garten, der zu seinem Standort passt, entwickelt sich mit den Jahren weiter – ohne ständig korrigiert werden zu müssen.",
      },
      { type: "h2", text: "Planung als langfristiger Prozess" },
      {
        type: "p",
        text: "Nachhaltige Gartengestaltung ist kein kurzfristiges Projekt. Wir planen Gärten so, dass sie sich über Jahre entwickeln dürfen: nicht alles auf einmal umzusetzen, Freiräume für Veränderung zu lassen, Pflege und Nutzung mitzudenken. Eine gute Planung verhindert spätere Korrekturen und unnötigen Pflegeaufwand.",
      },
      { type: "h2", text: "Nachhaltige Gartengestaltung mit natürlich grün" },
      {
        type: "p",
        text: "Wir von natürlich grün begleiten Menschen dabei, ihre Gärten Schritt für Schritt nachhaltig zu gestalten. Unsere Arbeit beginnt mit dem Standort und endet nicht mit der Pflanzung. Unsere Heimat ist Bad Münstereifel. Von hier aus arbeiten wir bis nach Euskirchen – und auf Wunsch und nach Absprache auch darüber hinaus.",
      },
      ...ctaBlocks(
        "Haben wir Ihr Interesse geweckt?",
        "Dann melden Sie sich gerne über unser Kontaktformular!",
      ),
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export const sortedPosts = [...posts].sort((a, b) =>
  a.date < b.date ? 1 : -1,
);
