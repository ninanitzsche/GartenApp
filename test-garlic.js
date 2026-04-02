// Simple test to verify our OpenAI service concept would work
// This simulates what our service would do

// Mock plant data for garlic (similar to what we'd get from Perenual)
const mockGarlicData = {
  common_name: "Garlic",
  scientific_name: ["Allium sativum"],
  family: "Amaryllidaceae",
  cycle: "Perennial",
  watering: "average",
  sunlight: ["full sun", "part shade"],
  hardiness: { min: "3", max: "8" },
  care_level: "Easy",
  growth_rate: "Medium",
  soil: ["well-drained", "loamy", "sandy"],
  maintenance: "Low",
  description: "Garlic is a species in the onion genus, Allium. Its close relatives include the onion, shallot, leek, chive, and Chinese onion.",
  flowering_season: "Summer",
  pruning_month: ["June", "July"]
};

// Function that simulates what our OpenAI service would generate for garlic
function generateMockGarlicCareInfo(plantName, scientificName, structuredData) {
  return {
    careInstructions: "Knoblauch ist eine relativ pflegeleichte Pflanze, die in den meisten Klimazonen gut gedeiht. Er bevorzugt sonnige Standorte und gut durchlässigen Boden.",
    wateringGuide: "Gieße Knoblauch mäßig - etwa einmal pro Woche bei trockenem Wetter. Der Boden sollte feucht, aber nicht nass sein. Reduziere das Gießen ein paar Wochen vor der Ernte, damit die Knollen austrocknen können.",
    sunlightGuide: "Knoblauch benötigt volle Sonne (6-8 Stunden täglich) für optimale Knollenbildung. Verträgt auch Halbschatten, aber die Ernte könnte geringer ausfallen.",
    soilGuide: "Ideal ist lockerer, gut durchlässiger Boden mit einem pH-Wert zwischen 6,0 und 7,0. Schwere Lehmböden sollten mit Sand oder Kompost verbessert werden, um Staunässe zu vermeiden.",
    fertilizingGuide: "Dünge im Frühjahr beim Austrieb mit einem stickstoffreichen Dünger. Ein weiterer leichter Düngungsgang kann erfolgen, wenn die Knollen beginnen zu schwellen. Vermeide Stickstoffdünger im späten Sommer, da dies das Blattwachstum statt der Knollenbildung fördert.",
    pruningGuide: "Knoblauch benötigt keinen regelmäßigen Schnitt. Entferne lediglich gelbe oder kranke Blätter. Die Blütenstiele sollten entfernt werden (genannt 'Ausgeizen'), damit die Pflanze Energie in die Knollenbildung steckt, statt in Blüte und Samenbildung.",
    commonProblems: [
      "Knoblauchrost: Pilzkrankheit mit orangen Pusteln auf Blättern - entferne befallene Blätter und verbessere Luftzirkulation",
      "Staunässe: führt zu Fäulnis der Knollen - sorge für gute Drainage",
      "Zwiebelfliege: Larven fressen an den Knollen - setzte Kulturnetze ein oder vermeide Anbau dort, wo vorjährig Zwiebeln standen"
    ],
    seasonalTips: {
      spring: "Pflanze Zehen im Herbst für Sommerernte oder früh im Frühjahr. Dünge beim Austritt und halte den Boden gleichmäßig feucht.",
      summer: "Halte Boden während der Knollenbildung gleichmäßig feucht. Entferne Blütenstiele, um Energie in Knollen zu lenken. Bereite Ernte vor, wenn Blätter zu gelben beginnen.",
      autumn: "Zeit zum Pflanzen für nächste Jahre Ernte! Setze Zehen 4-6 Wochen vor erstem Frost. Schneide Laub zurück nachdem es völlig abgekommen ist.",
      winter: "In milden Klimazonen weiterwachsen lassen. In kalten Regionen mit Stroh oder Laub vor Frost schützen. Geheime Knoblauchsorte für Frühjahrernte setzen."
    },
    difficultyLevel: "beginner"
  };
}

// Function that simulates what our OpenAI service would generate for tasks
function generateMockGarlicTasks(season) {
  const tasksBySeason = {
    spring: [
      {
        title: "Knoblauch setzen oder überwachen",
        description: "Wenn du Herbstknoblauch gesetzt hast, überwache den Austritt. Für Frühjahrsstecklinge setze einzelne Zehen jetzt mit der Spitze nach oben, 5cm tief und 15cm apart.",
        category: "pflanzen",
        priority: "high",
        season: "spring",
        frequency: "einmalig"
      },
      {
        title: "Frühjahrsdüngung anwenden",
        description: "Dünge mit stickstoffhaltigem Dünger (wie Hornspänen oder Kompost) beim ersten sichtbaren Austritt, um kräftiges Blattwachstum zu fördern.",
        category: "düngen",
        priority: "medium",
        season: "spring",
        frequency: "einmalig pro Saison"
      },
      {
        title: "Bodenfeuchtigkeit kontrollieren",
        description: "Prüfe regelmäßig, ob der Boden gleichmäßig feucht ist (nicht nass!). Knoblauch hasst sowohl Trockenstress als auch Staunässe.",
        category: "gießen",
        priority: "medium",
        season: "spring",
        frequency: "wöchentlich"
      }
    ],
    summer: [
      {
        title: "Blütenstiele entfernen",
        description: "Bei Sorten die neigen zu blühen, entferne die Blütenstiele sobald sie erscheinen. Das lenkt Energie in die Knollenbildung statt in Samenproduktion.",
        category: "pflegen",
        priority: "high",
        season: "summer",
        frequency: "bei Bedarf (alle 2-3 Wochen)"
      },
      {
        title: "Gießmenge anpassen",
        description: "Während der Knollenbildung gleichmäßig feucht halten, aber vermeide übermäßiges Gießen welches zu Fäulnis führen kann.",
        category: "gießen",
        priority: "medium",
        season: "summer",
        frequency: "2-3 mal pro Woche bei warmem Wetter"
      },
      {
        title: "Auf Schädlinge prüfen",
        description: "Kontrolle speziell auf Zwiebelfliege und Thripse. Bei Befall geeignete biologische Kontrollmaßnahmen einsetzen.",
        category: "kontrollieren",
        priority: "medium",
        season: "summer",
        frequency: "wöchentlich"
      }
    ]
  };
  
  return tasksBySeason[season] || tasksBySeason.spring;
}

// Test function
function testGarlicGeneration() {
  console.log('=== Testing Garlic Plant Care Generation ===\n');
  
  // Test care info generation
  console.log('1. Generierte Pflegeinformationen:');
  const careInfo = generateMockGarlicCareInfo(
    "Knoblauch",
    "Allium sativum",
    mockGarlicData
  );
  
  console.log('Care Instructions:', careInfo.careInstructions);
  console.log('Watering Guide:', careInfo.wateringGuide.substring(0, 100) + '...');
  console.log('Difficulty Level:', careInfo.difficultyLevel);
  console.log('Seasonal Tips Count:', Object.keys(careInfo.seasonalTips).length);
  console.log();
  
  // Test task generation
  console.log('2. Generierte Frühjahrs-Tasks:');
  const springTasks = generateMockGarlicTasks('spring');
  console.log(`Anzahl Tasks: ${springTasks.length}`);
  springTasks.forEach((task, index) => {
    console.log(`  ${index+1}. [${task.priority}] ${task.title}`);
    console.log(`      Kategorie: ${task.category}`);
    console.log(`      Beschreibung: ${task.description.substring(0, 80)}...`);
    console.log();
  });
  
  console.log('3. Generierte Sommer-Tasks:');
  const summerTasks = generateMockGarlicTasks('summer');
  console.log(`Anzahl Tasks: ${summerTasks.length}`);
  summerTasks.forEach((task, index) => {
    console.log(`  ${index+1}. [${task.priority}] ${task.title}`);
    console.log(`      Kategorie: ${task.category}`);
    console.log(`      Beschreibung: ${task.description.substring(0, 80)}...`);
    console.log();
  });
  
  console.log('✅ Test erfolgreich abgeschlossen!');
  console.log('\nIn der echten Implementation würden diese Daten vom OpenAI API kommen,');
  console.log('aber die Struktur und Verwendung im App wäre identisch.');
}

// Run the test
testGarlicGeneration();