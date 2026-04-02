-- Add Latin names to existing plants
-- Date: 2026-04-01
-- This migration adds scientific/latin names to common garden plants

-- Update common vegetable plants with their Latin names
UPDATE plants 
SET latin_name = 'Solanum lycopersicum'
WHERE name = 'Tomate' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Solanum tuberosum'
WHERE name = 'Kartoffel' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Cucumis sativus'
WHERE name = 'Gurke' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Capsicum annuum'
WHERE name = 'Paprika' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Lactuca sativa'
WHERE name = 'Salat' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Spinacia oleracea'
WHERE name = 'Spinat' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Brassica oleracea var. capitata'
WHERE name = 'Kohl' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Brassica oleracea var. botrytis'
WHERE name = 'Blumenkohl' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Beta vulgaris subsp. vulgaris'
WHERE name = 'Rote Bete' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Daucus carota subsp. sativus'
WHERE name = 'Karotte' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Raphanus sativus'
WHERE name = 'Radieschen' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Pisum sativum'
WHERE name = 'Erbsen' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Phaseolus vulgaris'
WHERE name = 'Bohnen' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Allium cepa'
WHERE name = 'Zwiebel' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Allium sativum'
WHERE name = 'Knoblauch' AND latin_name IS NULL;

-- Update common herbs
UPDATE plants 
SET latin_name = 'Ocimum basilicum'
WHERE name = 'Basilikum' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Petroselinum crispum'
WHERE name = 'Petersilie' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Anethum graveolens'
WHERE name = 'Dill' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Mentha × piperita'
WHERE name = 'Pfefferminze' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Origanum vulgare'
WHERE name = 'Oregano' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Thymus vulgaris'
WHERE name = 'Thymian' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Rosmarinus officinalis'
WHERE name = 'Rosmarin' AND latin_name IS NULL;

-- Update common flowers
UPDATE plants 
SET latin_name = 'Tagetes patula'
WHERE name = 'Ringelblume' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Tropaeolum majus'
WHERE name = 'Kapuzinerkresse' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Helianthus annuus'
WHERE name = 'Sonnenblume' AND latin_name IS NULL;

-- Add Latin name for Monstera (our test plant)
UPDATE plants 
SET latin_name = 'Monstera deliciosa'
WHERE name = 'Monstera' AND latin_name IS NULL;

-- Add Latin name for common fruit plants
UPDATE plants 
SET latin_name = 'Fragaria × ananassa'
WHERE name = 'Erdbeere' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Rubus idaeus'
WHERE name = 'Himbeere' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Vitis vinifera'
WHERE name = 'Traube' AND latin_name IS NULL;

-- Add Latin name for common trees
UPDATE plants 
SET latin_name = 'Malus domestica'
WHERE name = 'Apfelbaum' AND latin_name IS NULL;

UPDATE plants 
SET latin_name = 'Prunus domestica'
WHERE name = 'Pflaume' AND latin_name IS NULL;