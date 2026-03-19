/**
 * Seed Knowledge Articles from Garten2026
 * Populates the knowledge_articles table with German gardening articles
 * Run with: npx ts-node scripts/seed-knowledge.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables (SUPABASE_SERVICE_ROLE_KEY required for seeding)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const articles = [
  // PERMAKULTUR & GRUNDPRINZIPIEN
  {
    title: 'Permakultur für Low-Maintenance Gärten',
    content:
      'Permakultur bedeutet: Mit der Natur arbeiten, nicht gegen sie. Statt ständig Unkraut zu jäten, nutze lebenden Mulch. Statt künstliche Dünger: Stickstoffsammler (Bohnen, Rotklee) neben Starkzehrern pflanzen. Blüten (Phacelia, Katzenminze, Rittersporn) locken Nützlinge an, die für dich die Schädlingsbekämpfung übernehmen. Ziel: Ein Garten, der nach dem ersten Sommer fast ohne dein Eingreifen auskommt.',
    category: 'pflanze',
  },
  {
    title: 'Lichtregal - Strategisches Zentrum der Anzucht',
    content:
      'Das Lichtregal in deiner Küche ist deine "Geburtsstation" für Starkzehrer. Mit Quick Pots und Pflanzenlicht ziehst du Tomaten, Riesenzwiebeln und andere Frostempfindliche vor. Sie erhalten einen 8-10 Wochen Vorsprung und kräftige Wurzeln bevor sie ins Beet gehen. Vorteil: Schneckenfraß-Risiko sinkt dramatisch. Alle Pflanzen starten mit optimalen Bedingungen.',
    category: 'pflanze',
  },
  {
    title: 'Balkon-Kindergarten - Bodendecker-Vermehrung',
    content:
      'Der Balkon ist deine Übergangszone für Blaukissen, Lavendel und Thymian. Diese ziehen erst den Sommer über in Balkonkästen auf. Dort gewöhnen sie sich an Wind und echtes UV-Licht, während sie dichte Polster bilden. Im September sind sie robust genug, um als dauerhafte, wintergrüne Bodendecker ins Beet zu gehen. Ab 2027 brauchen sie fast keine Pflege mehr.',
    category: 'pflanze',
  },
  // MONATLICHE AUFGABEN
  {
    title: 'März: Aussaat & Beetvorbereitung - Los geht\'s!',
    content:
      'Der März ist der Startmonat. Im Lichtregal: Tomaten (alle 4 Sorten), Riesenzwiebel The Kelsae und Bärlauch aussäen. Direkt ins Beet: Neuseeländer Spinat, Rotklee & Phacelia. An der Zaunseite: Wildblumenmischung dick aussäen. Gartenarbeiten: Beete vorbereiten, Unkraut entfernen, Mulch kontrollieren. Balkon-Kindergarten vorbereiten: Blaukissen, Lavendel, Thymian in Anzuchtschalen vorziehen.',
    category: 'pflege',
  },
  {
    title: 'April: Kartoffeln legen & Starkzehrer vorziehen',
    content:
      'Mitte April nach der letzten Frostgefahr (ab 15.04): Kartoffeln legen (Sorten: Innovator, Laura, Agria, Spunta, Cara). Pflanztiefe: 10cm, Abstand: 30-40cm. Im Lichtregal: Mais, Kürbis, Gurke, Melone aussäen - diese brauchen 6-8 Wochen. Pergola vorbereiten für Ranker. Schneckenbarrieren (Kupferband, Schneckenzaun) anbringen. Tomaten im Lichtregal sollten jetzt auf 10-15cm Höhe pikiert werden.',
    category: 'pflege',
  },
  {
    title: 'Mai: Auspflanzen nach den Eisheiligen (ab 15.05)',
    content:
      'KRITISCHER ZEITPUNKT - nicht früher! Nach dem 15. Mai: Tomaten, Riesenzwiebel, Mais, Kürbis, Gurke, Melone, Basilikum aus dem Lichtregal ins Beet. Tomaten tief eingraben bis zu den ersten echten Blättern (bildet mehr Wurzeln). Direkt ins Beet: Bohnen, Sojabohne, Kohlrabi, Lauchzwiebel, Zwiebel. Einjährige Blumen aussäen. Mulch ausbringen. Gießsystem vorbereiten.',
    category: 'pflege',
  },
  {
    title: 'Juni: Ausgeizen, Anhäufeln & Mulchen',
    content:
      'Tomaten ausgeizen: Regelmäßig Seitentriebe entfernen für besseren Ertrag. Kartoffeln 2. Mal anhäufeln. Weinreben: Überschüssige Triebe entfernen. Alle freien Flächen mulchen (Spinat, Stroh, Grasschnitt). Günsel-Ableger mit Wurzeln für September-Pflanzung vorbereiten. Auf Schädlinge beobachten: Läuse? Schnecken? Nützlinge aktiv? Bei Trockenheit gießen, besonders Starkzehrer.',
    category: 'pflege',
  },
  {
    title: 'Juli-August: Ernte beginnt - Hauptsaison',
    content:
      'Juli: Bohnen, Kohlrabi, Lauchzwiebel, Schnittlauch ernten. Tomaten weiter ausgeizen. Petersilie & Basilikum regelmäßig ernten (fördert Wachstum). August: Haupternte beginnt - Tomaten, Gurken, Bohnen, Mais, Kürbis. Kartoffeln (mittelfrühe Sorten) ernten. Beerenernte. Grüne Tomaten nachreifen lassen. Samen sammeln von Tomaten und Blumen für nächstes Jahr.',
    category: 'ernte',
  },
  {
    title: 'September: Balkon-Kindergarten auspflanzen - Bodendecker-Strategie',
    content:
      'ZAUNSEITE: Blaukissen, Lavendel, Thymian, Katzenminze entlang der Zaunlinie pflanzen (30-40cm Abstand). GÜNSEL-ABLEGER (Schatz!) auspflanzen: Hochbeet-Rand, Pergola-Unterpflanzung, Zaunseite, schattige Ecken. Abstand 25-30cm. Spätere Kartoffelsorten ernten. Rotklee & Phacelia stehen lassen (Gründüngung über Winter). Blaukissen, Lavendel, Thymian sollten angewachsen sein.',
    category: 'pflanze',
  },
  {
    title: 'Oktober-Februar: Winterpflege & Vorbereitung',
    content:
      'Oktober: Letzte Ernten. Rotklee & Phacelia stehen lassen. Neuseeländer Spinat stirbt bei Frost und wird zu Mulch. November-Dezember: Weinreben schneiden, alte Erdbeeren-Blätter entfernen, Mulch liegen lassen (schützt Boden). Winter: Blaukissen, Lavendel, Thymian beobachten - sind sie wintergrün und Frost-resistent? Ab Februar: Planung für nächstes Gartenjahr.',
    category: 'pflege',
  },
  // LEBENDER MULCH & BODENBEWIRTSCHAFTUNG
  {
    title: 'Neuseeländer Spinat - Der essbare Mulch-Teppich',
    content:
      'Der Neuseeländer Spinat ist deine Haupt-Mulch-Strategie. Er schützt den Boden vor Austrocknung, unterdrückt Unkraut und ist essbar. Aussaat März/April direkt ins Beet. Bildet schnell einen dichten Teppich. Höhe: 15-20cm. Vorteil: Nährstoffreich (Blattdünger), selbstaussaend. Nachteil: Nicht winterhart. Alternative/Ergänzung: Feldsalat für Winter.',
    category: 'boden',
  },
  {
    title: 'Feldsalat - Winterharter Mulch & Salat zugleich',
    content:
      'Feldsalat (nichtschießend, Sorten: Vit, Favor, Gala) ist eine hervorragende Alternative/Ergänzung zum Neuseeländer Spinat. Höhe: nur 5-10cm (kein Schatten). Winterhart bis -15°C! Selbstaussaend einmal gesät, jahrelang da. Bildet dichte Rosetten. Essbar Nov-März (frischer Wintersalat!). Aussaat März-April (Frühjahr) und August-September (Winter). Bewertung: 9/10 - perfekt für Herbst/Winter.',
    category: 'boden',
  },
  {
    title: 'Weißklee - Mehrjähriger Stickstoff-Dünger',
    content:
      'Weißklee (Trifolium repens) ist MEHRJÄHRIG - einmal säen, jahrelang da! Höhe: 10-20cm. Stickstoff-Sammler = düngt deine Beete selbst! Sehr dicht, unterdrückt Unkraut perfekt. Wintergrün. Bienen-Magnet. Nachteil: Nicht so essbar wie Spinat/Salat. Ab 2027: Perfekt für dein No-Maintenance Ziel. Aussaat April oder September. 50-100g reicht für den ganzen Garten.',
    category: 'boden',
  },
  {
    title: 'Portulak - Schnell wachsender Sommer-Mulch',
    content:
      'Portulak (Sommer-Variante): Kriechend, fleischige Blätter, wuchert schnell. Essbar (lecker im Salat, reich an Omega-3). Sehr trockenheitsresistent. Sät sich massiv selbst aus. Nachteil: Stirbt bei Frost. Winterportulak/Postelein: Winterhart bis -20°C, essbar im Winter, ideale Ergänzung für Winter-Mulch. Zusammen mit Feldsalat: Ganzjährig bedeckt = Permakultur-Ideal.',
    category: 'boden',
  },
  {
    title: 'Rotklee - Gründüngung für Fruchtbarkeit',
    content:
      'Rotklee (mehrjährig) ist dein Stickstoff-Sammler zwischen Kartoffeln. Aussaat März/April direkt ins Beet zwischen Kartoffel-Reihen. Bleibt nach Kartoffelernte stehen! Überwintert und düngt nächstes Jahr weiter. Blüht im Sommer (Nützlinge!). Unterharken = Gründüngung. Ergänzt perfekt dein Permakultur-System mit natürlicher Bodenfruchtbarkeit.',
    category: 'boden',
  },
  // TOMATEN IM GEWÄCHSHAUS
  {
    title: 'Tomaten im Gewächshaus - 4-Sorten-System',
    content:
      'Vier Sorten bringen Abwechslung und Sicherheit: (1) Kirschtomate Zuckertraube (sehr hoch, 180-200cm). (2) Tomate Matina - robust, früh, guter Ertrag. (3) Fleischtomate Marmande BIO - große Früchte (200-300g), braucht starken Stab. (4) Tomate Tom Red - kompakt (100-120cm), sehr ertragreich. Pflanzabstände: 60cm zwischen Tomaten, 50cm zur Wand, 80cm zur Tür. Pflanztechnik: März im Lichtregal aussäen, 15.05 auspflanzen (tief eingraben).',
    category: 'pflanze',
  },
  {
    title: 'Basilikum neben Tomaten - Aromaverstärkung & Schädlingsabwehr',
    content:
      'Basilikum ist der perfekte Tomaten-Begleiter! Warum: (1) Vertreibt Schädlinge (Weiße Fliege, Blattläuse). (2) Verstärkt Tomaten-Aroma (alte Gärtner-Tradition). (3) Nutzt Zwischenraum optimal. (4) Essbar - perfekt für Tomate-Mozzarella! 6-8 Pflanzen zwischen den Tomaten (vorne). Aussaat April im Lichtregal, Auspflanzen 15.05. Regelmäßig Spitzen ernten = buschiger Wuchs. Blüten ausbrechen (sonst wird bitter).',
    category: 'pflanze',
  },
  // KARTOFFEL-MAIS-SYSTEM
  {
    title: 'Kartoffel-Mais-Bohnen System - Staffelung nach Licht',
    content:
      'Permakultur-Layout im Hauptbeet (10-15m², Süd nach Nord): HINTERREIHE (Nord): Mais (8-10 Pflanzen, Quadrat-Formation für Windbestäubung). MITTE: Kartoffeln 5 Sorten (50 Stück): Innovator, Laura, Agria, Spunta, Cara. Zwischen den Kartoffel-Reihen: Buschbohnen, Sojabohne, Rotklee, Phacelia (= Stickstoff + Nützlinge). VORDERREIHE (Süd): Kohlrabi, Zwiebeln, Lauchzwiebel (niedrig, kein Schatten). Überall: Neuseeländer Spinat als Mulch.',
    category: 'pflanze',
  },
  {
    title: 'Kartoffeln pflanzen - Timing & Abstände',
    content:
      'Kartoffeln legen Mitte April nach letztem Frost (15.04). Pflanztiefe: 10cm. Abstand in Reihe: 30-40cm. Zwischen Reihen: 50-60cm (Platz zum Anhäufeln + Durchgang). 5 Sorten für Vielfalt: Innovator (mittelfrüh-spät), Laura (mittelfrüh, doppelte Reihe!), Agria (mittelspät), Spunta (mittelfrüh), Cara (spät). Erntemonate: Laura/Agria Juli-August (mittelfrüh), Innovator/Cara September-Oktober (spät). Anhäufeln wichtig: Juni + Juli (2x).',
    category: 'pflanze',
  },
  {
    title: 'Mais im Quadrat - Windbestäubung & Nützlings-Hotspot',
    content:
      'Mais in Quadrat-Formation pflanzen (nicht in Reihe!): 3x3 oder 2x3 Pflanzen, Abstand 40x40cm. Grund: Windbestäubung funktioniert besser. Aussaat April im Lichtregal (Quick Pots), Auspflanzen 15.05 nach Eisheiligen. Höhe: 150-200cm = perfekt als Hinterreihe (kein Schatten auf Kartoffeln). Buschbohnen direkt daneben pflanzen: Kletterhilfe + Stickstoff-Fixierung = perfekte Symbiose!',
    category: 'pflanze',
  },
  {
    title: 'Buschbohne Saxa & Sojabohne - Stickstoff-Sammler',
    content:
      'Buschbohne Saxa und Sojabohne (Dame Hanaé) zwischen Kartoffel-Reihen pflanzen. Warum: Stickstoff-Fixierer = düngen deine Kartoffeln! Buschbohne: 5-6 Pflanzen, Abstand 40cm (zwischen Kartoffel-Reihen 1-2). Sojabohne: 4-5 Pflanzen, Abstand 50cm (zwischen Reihen 2-3). Aussaat Mai (direkt ins Beet). Erntezeit Juli-August. Nebeneffekt: Bohnen-Ernte für dich! Essbar und nährstoffreich.',
    category: 'pflanze',
  },
  // SCHÄDLINGSBEKÄMPFUNG & NÜTZLINGE
  {
    title: 'Phacelia - Der Bienenfreund & Gründünger',
    content:
      'Phacelia ist dein Nützlings-Magnet. Aussaat März/April zwischen Kartoffeln und an der Zaunseite. Blüht im Sommer (lila Blüten) = lockt massiv Nützlinge an. Diese übernehmen die Schädlingsbekämpfung für dich! Nach Blüte: unterharken = Gründüngung. Stickstoff-Sammler. Sehr robust. Gibt es als Wildblumenmischung (perfekt für Zaunseite). Bewertung: ESSENTIAL für Permakultur-System.',
    category: 'schädlinge',
  },
  {
    title: 'Wildblumen & Bodendecker - Nützlings-Strategie an der Zaunseite',
    content:
      'An der Zaunseite: Wildblumenmischung + Phacelia + Sonnenhut dick aussäen (März direkt aufs gemähte Gras). September: Balkon-Kindergarten auspflanzen (Blaukissen, Lavendel, Thymian, Katzenminze) + Günsel-Ableger. Ziel: Blühender Streifen statt Rasenkante = BIENENMAGNET + natürliche Schädlingsbekämpfung! Ab 2027: Mehrjähriger Blüh- und Bodendecker-Streifen. Größter Gewinn für Ökosystem.',
    category: 'schädlinge',
  },
  {
    title: 'Günsel - Der kostenlosen Bodendecker-Schatz',
    content:
      'Günsel (Ajuga reptans) - einer der BESTEN Bodendecker! Wintergrün, blaue Blüten (April-Juni), kriechend, bildet dichte Teppiche. Mehrjährig, null Pflege, Bienenmagnet, essbar, unterdrückt Unkraut perfekt. DU HAST IHN SCHON! Juni-August: Ableger mit Wurzeln schneiden, in Töpfe setzen (Vermehrung!). September: Auspflanzen - Hochbeet-Rand, Pergola-Unterpflanzung, Zaunseite, schattige Ecken. Abstand 25-30cm. = Kostenloser Bodendecker-Vorrat für Jahre!',
    category: 'boden',
  },
  // BLÜTEN & STAUDEN
  {
    title: 'Balkon-Kindergarten Pflanzen - Blaukissen, Lavendel, Thymian, Katzenminze',
    content:
      'Dein Balkon-Kindergarten für mehrjährige Bodendecker/Stauden: 10x Blaukissen (20-30cm Abstand im September), 2x Lavendel (30-40cm), Thymian (25-30cm, bildet Polster), Katzenminze (40-50cm). Aussaat März-April in Anzuchtschalen, April-Mai in Balkonkästen umtopfen. Sommer: Auf Balkon - gewöhnen sich an Wind & UV. September: Auspflanzen - Blaukissen für "Garten-Pläne", Lavendel & Thymian für Zaunseite, Katzenminze gemischt. Ab 2027: Wintergrüne, blühende Stauden mit fast ZERO Pflege.',
    category: 'pflanze',
  },
  {
    title: 'Einjährige Blumen aussäen - Rittersporn, Sonnenhut, Ringelblume, Sonnenblume',
    content:
      'Einjährige Blumen aussäen Mai direkt ins Beet und an Beeträndern: Rittersporn (blau, wunderschön), Sonnenhut (orange/gelb, Nützlinge!), Ringelblume (essbar, Salben-Pflanze), Sonnenblume (gross, Bienen + Samen). Wildblumenmischung an der Zaunseite. Diese locken Nützlinge an und machen deinen Garten zum Paradies. Samen sammeln im Herbst für nächstes Jahr (Selbstaussaat). Viele säen sich von selbst aus.',
    category: 'pflanze',
  },
  // ERNTE & LAGERUNG
  {
    title: 'Kartoffel-Lagerung - Haltbar machen für Winter',
    content:
      'Nach Ernte (Juli-Oktober je nach Sorte): Kartoffeln in dunkler, kühler Umgebung lagern (4-8°C ideal). Keller, Garage oder gut isolierter Schuppen. Beschädigte Kartoffeln aussortieren (faulen schneller). Gut belüftet lagern (nicht in Plastik-Säcken!). Helles Licht vermeiden (Solanin-Bildung = giftig). Unter optimalen Bedingungen: 6-8 Monate Haltbarkeit (Januar-Mai). Deine 5 Sorten ermöglichen staffelierte Ernte: Juli (Laura), August (Agria, Spunta), Oktober (Innovator, Cara).',
    category: 'ernte',
  },
  {
    title: 'Tomaten lagern & nachreifen - Grüne Früchte verwerten',
    content:
      'Oktober: Letzte grüne Tomaten ernten (vor Frost). Nachreifen lassen in Karton mit Papier (Ethylen-Gas). Temperatur 18-20°C ideal. Täglich kontrollieren. Oder: Mit reifen Äpfeln lagern (Äpfel produzieren Ethylen = beschleunigt Reifung). Lagerfähige Sorten (Matina, Marmande, Tom Red) halten 2-3 Wochen. Kirschtomate Zuckertraube: schneller reif, weniger Lagerung. Lagerung: 12-15°C, nie im Kühlschrank!',
    category: 'ernte',
  },
  // SAMMELEI & VIELFALT
  {
    title: 'Saatgut sammeln & lagern - Für nächstes Jahr planen',
    content:
      'September-Oktober: Samen sammeln von Tomaten (ausreifen lassen), Blumen (trocknen, ausklopfen), Bohnen, Kürbis. Trocknung: 2-4 Wochen an luftigem Ort, nicht in der Sonne. Lagern: Luftdicht (gläserne Behälter oder Papiertüten), kühl (4-10°C), trocken (30-50% Luftfeuchte). Etiketten: Sorte + Erntedatum. Haltbarkeit: Meist 2-4 Jahre, Bohnen länger. Selbstaussaat (Wildblumen, Feldsalat) übernimmt das für dich! Zukunfts-Unabhängigkeit.',
    category: 'ernte',
  },
];

async function seedKnowledge() {
  try {
    console.log('Checking existing knowledge articles...');

    // Check if articles already exist
    const { data: existing, error: checkError } = await supabase
      .from('knowledge_articles')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking articles:', checkError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('Knowledge articles already exist. Skipping seed.');
      return;
    }

    console.log(`Seeding ${articles.length} knowledge articles...`);

    // Insert articles
    const articlesToInsert = articles.map((article) => ({
      ...article,
      user_id: null, // System articles
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('knowledge_articles')
      .insert(articlesToInsert)
      .select();

    if (error) {
      console.error('Error inserting articles:', error);
      process.exit(1);
    }

    console.log(`✓ Successfully seeded ${data?.length || 0} knowledge articles from Garten2026`);

    // Summary by category
    const categories: Record<string, number> = {};
    articles.forEach((a) => {
      categories[a.category] = (categories[a.category] || 0) + 1;
    });

    console.log('\nCategory Distribution:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} articles`);
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

seedKnowledge();
