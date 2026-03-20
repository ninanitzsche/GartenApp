-- =====================================================
-- Seed data for plant_companions (run after migration)
-- Date: 2026-03-21
-- =====================================================

TRUNCATE TABLE plant_companions RESTART IDENTITY;

INSERT INTO plant_companions (plant_name, plant_name_de, category, good_companions, good_reasons, bad_companions, bad_reasons, nitrogen_fixer, pest_repellent) 
SELECT 
  'tomato' as plant_name, 'Tomate' as plant_name_de, 'gemüse' as category,
  ARRAY['basil', 'carrot', 'parsley', 'marigold', 'nasturtium', 'garlic'] as good_companions,
  ARRAY['Basilikum vertreibt Schadinsekten', 'Karotten lockern den Boden', 'Petersilie vertreibt Schädlinge'] as good_reasons,
  ARRAY['potato', 'cabbage', 'fennel', 'corn'] as bad_companions,
  ARRAY['Kartoffeln: Krautfäule', 'Kohl: Nährstoffkonkurrenz', 'Fenchel: unterdrückt'] as bad_reasons,
  false as nitrogen_fixer,
  ARRAY['blattläuse'] as pest_repellent
UNION ALL SELECT 'carrot', 'Karotte', 'gemüse', ARRAY['onion', 'lettuce', 'radish', 'pea', 'chive', 'rosemary', 'sage'], ARRAY['Zwiebeln vertreiben Karottenfliege', 'Erbsen lockern Boden'], ARRAY['dill', 'beet'], ARRAY['Dill hemmt Wachstum', 'Rote Bete: Konkurrenz'], false, '{}'
UNION ALL SELECT 'onion', 'Zwiebel', 'gemüse', ARRAY['carrot', 'beet', 'strawberry', 'lettuce', 'tomato'], ARRAY['Zwiebeln vertreiben Karottenfliege'], ARRAY['pea', 'bean'], ARRAY['Erbsen: Stickstoffkonkurrenz'], false, ARRAY['karottenfliege', 'blattläuse']
UNION ALL SELECT 'pea', 'Erbsen', 'gemüse', ARRAY['carrot', 'radish', 'spinach', 'corn', 'cucumber'], ARRAY['Fixieren Stickstoff', 'Lockern Boden'], ARRAY['onion', 'garlic', 'leek', 'chive'], ARRAY['Allium hemmt Erbsen'], true, '{}'
UNION ALL SELECT 'bean', 'Bohnen', 'gemüse', ARRAY['corn', 'cucumber', 'potato', 'strawberry', 'radish'], ARRAY['Stickstofffixierung', 'Mais als Stütze'], ARRAY['onion', 'garlic', 'leek', 'chive'], ARRAY['Allium hemmt Bohnen'], true, '{}'
UNION ALL SELECT 'cucumber', 'Gurke', 'gemüse', ARRAY['bean', 'pea', 'radish', 'corn', 'sunflower'], ARRAY['Dill zieht Nützlinge an'], ARRAY['potato', 'tomato', 'sage'], ARRAY['Kartoffeln: Krautfäule'], false, '{}'
UNION ALL SELECT 'lettuce', 'Salat', 'gemüse', ARRAY['carrot', 'radish', 'strawberry', 'chive', 'onion'], ARRAY['Mischen mit Zwiebeln vertreibt Blattläuse'], ARRAY['parsley'], ARRAY['Petersilie hemmt'], false, ARRAY['blattläuse']
UNION ALL SELECT 'radish', 'Radieschen', 'gemüse', ARRAY['carrot', 'lettuce', 'pea', 'cucumber'], ARRAY['Schnelle Keimung zeigt Reihen'], ARRAY['hyssop'], ARRAY['Ysop hemmt'], false, '{}'
UNION ALL SELECT 'spinach', 'Spinat', 'gemüse', ARRAY['strawberry', 'pea', 'bean', 'radish'], ARRAY['Fixieren Stickstoff'], ARRAY['garlic', 'onion'], ARRAY['Allium hemmt'], true, '{}'
UNION ALL SELECT 'potato', 'Kartoffel', 'gemüse', ARRAY['bean', 'corn', 'cabbage', 'horseradish', 'marigold'], ARRAY['Bohnen fixieren Stickstoff', 'Meerrettich vertreibt Käfer'], ARRAY['tomato', 'cucumber', 'pumpkin'], ARRAY['Tomaten: Krautfäule'], false, ARRAY['kartoffelkäfer']
UNION ALL SELECT 'cabbage', 'Kohl', 'gemüse', ARRAY['bean', 'celery', 'dill', 'lettuce', 'onion', 'sage'], ARRAY['Sellerie vertreibt Weiße Fliege', 'Dill zieht Nützlinge an'], ARRAY['strawberry', 'grape', 'tomato'], ARRAY['Erdbeeren: Nährstoffkonkurrenz'], false, ARRAY['kohlweißling', 'weiße fliege']
UNION ALL SELECT 'pepper', 'Paprika', 'gemüse', ARRAY['basil', 'carrot', 'tomato', 'onion'], ARRAY['Basilikum vertreibt Schadinsekten'], ARRAY['fennel', 'bean'], ARRAY['Fenchel: allelopathisch'], false, ARRAY['blattläuse']
UNION ALL SELECT 'basil', 'Basilikum', 'kräuter', ARRAY['tomato', 'pepper', 'asparagus'], ARRAY['Vertreibt Blattläuse', 'Verbessert Tomatengeschmack'], ARRAY['sage', 'thyme'], ARRAY['Inkompatibel mit Salbei/Thymian'], false, ARRAY['blattläuse', 'fruchtfliegen']
UNION ALL SELECT 'dill', 'Dill', 'kräuter', ARRAY['carrot', 'cucumber', 'lettuce', 'onion'], ARRAY['Zieht Schlupfwespen und Bienen an'], ARRAY['tomato', 'bean'], ARRAY['Dill kann Tomaten/Bohnen hemmen'], false, ARRAY['schlupfwespen', 'bienen']
UNION ALL SELECT 'parsley', 'Petersilie', 'kräuter', ARRAY['tomato', 'radish', 'asparagus', 'carrot'], ARRAY['Vertreibt Blattläuse'], ARRAY['lettuce', 'mint'], ARRAY['Minze überwuchert'], false, ARRAY['blattläuse']
UNION ALL SELECT 'chive', 'Schnittlauch', 'kräuter', ARRAY['carrot', 'tomato', 'roses', 'strawberry'], ARRAY['Vertreibt Blattläuse und Karottenfliege'], ARRAY['pea', 'bean'], ARRAY['Hemmung Erbsen/Bohnen'], false, ARRAY['blattläuse', 'karottenfliege']
UNION ALL SELECT 'rosemary', 'Rosmarin', 'kräuter', ARRAY['carrot', 'bean', 'cabbage', 'sage'], ARRAY['Vertreibt Kohlweißling und Bohnenkäfer'], ARRAY['cucumber', 'pumpkin'], ARRAY['Nicht optimal für Gurken'], false, ARRAY['kohlweißling', 'bohnenkäfer']
UNION ALL SELECT 'sage', 'Salbei', 'kräuter', ARRAY['carrot', 'cabbage', 'rosemary', 'thyme', 'strawberry'], ARRAY['Vertreibt Kohlweißling und Möhrenfliege'], ARRAY['basil', 'cucumber', 'onion'], ARRAY['Inkompatibel mit Basilikum'], false, ARRAY['kohlweißling', 'möhrenfliege']
UNION ALL SELECT 'thyme', 'Thymian', 'kräuter', ARRAY['cabbage', 'eggplant', 'potato', 'strawberry', 'tomato'], ARRAY['Vertreibt Kohlweißling', 'Fördert Erdbeeren'], ARRAY['basil'], ARRAY['Zu feucht für Thymian'], false, ARRAY['kohlweißling']
UNION ALL SELECT 'mint', 'Minze', 'kräuter', ARRAY['cabbage', 'tomato', 'pea'], ARRAY['Vertreibt Kohlweißling und Blattläuse'], ARRAY['parsley'], ARRAY['Minze überwuchert alles'], false, ARRAY['kohlweißling', 'blattläuse']
UNION ALL SELECT 'marigold', 'Ringelblume', 'blumen', ARRAY['tomato', 'cucumber', 'potato', 'strawberry', 'squash'], ARRAY['Vertreibt Nematoden, Blattläuse und Weiße Fliege', 'Lockt Bestäuber an'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], false, ARRAY['nematoden', 'blattläuse', 'weiße fliege']
UNION ALL SELECT 'nasturtium', 'Kapuzinerkresse', 'blumen', ARRAY['tomato', 'cucumber', 'cabbage', 'radish', 'squash'], ARRAY['Lockt Blattläuse an und hält sie fern', 'Vertreibt Weiße Fliege'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], false, ARRAY['blattläuse', 'weiße fliege', 'kürbiskäfer']
UNION ALL SELECT 'sunflower', 'Sonnenblume', 'blumen', ARRAY['cucumber', 'corn', 'squash', 'lettuce', 'potato'], ARRAY['Lockt Bestäuber an', 'Schattenspender für Gurken'], ARRAY['potato', 'bean'], ARRAY['Konkrete Konflikte möglich'], false, ARRAY['bienen', 'bestäuber']
UNION ALL SELECT 'strawberry', 'Erdbeere', 'obst', ARRAY['lettuce', 'spinach', 'onion', 'thyme', 'sage', 'bean', 'pea'], ARRAY['Thymian vertreibt Schadinsekten', 'Zwiebeln verbessern Geschmack'], ARRAY['cabbage', 'broccoli'], ARRAY['Kreuzblütler konkurrieren'], false, ARRAY['schadinsekten']
UNION ALL SELECT 'zucchini', 'Zucchini', 'gemüse', ARRAY['bean', 'corn', 'radish', 'lettuce', 'nasturtium', 'marigold'], ARRAY['Mais als Windschutz', 'Ringelblumen gegen Blattläuse'], ARRAY['potato'], ARRAY['Kartoffeln: Nährstoffkonkurrenz'], false, ARRAY['blattläuse']
UNION ALL SELECT 'eggplant', 'Aubergine', 'gemüse', ARRAY['bean', 'pepper', 'spinach', 'thyme', 'marigold'], ARRAY['Bohnen fixieren Stickstoff', 'Thymian vertreibt Schadinsekten'], ARRAY['fennel'], ARRAY['Fenchel hemmt Wachstum'], false, ARRAY['blattläuse'];
