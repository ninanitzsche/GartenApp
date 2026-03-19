# 🌱 Plant-Knowledge Links Setup Required

The linking script is ready, but we need to add a database column first.

## Step 1: Run this SQL in Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **Create New Query**
5. Paste the SQL below:

```sql
-- Add knowledge_article_ids field to plants table
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS knowledge_article_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_plants_knowledge_articles ON public.plants USING GIN(knowledge_article_ids);

-- Verify column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plants'
  AND column_name = 'knowledge_article_ids';
```

6. Click **Run**
7. You should see the column confirmation at the bottom

## Step 2: Run the Link Script

Once the SQL completes, run:

```bash
npm run link:plants
```

This will:
- Load all 46+ plants from your garden
- Load all 38 knowledge articles
- Match them using intelligent keyword matching
- Create bidirectional links so you can navigate:
  - Plant → Related Knowledge Articles
  - Knowledge Article → Related Plants

## What Gets Linked?

The script uses semantic keyword matching to find connections:

- **Kartoffel** (Potato) → Mulching, No-Dig planting, care guides
- **Tomate** (Tomato) → Watering, fertilizing, pruning guides
- **Basilikum** (Basil) → Companion planting, care articles
- **Mais** (Corn) → Three Sisters technique, spacing guides
- And many more!

---

Once SQL is complete and script runs successfully, the web interface will show:

✅ Plant detail → "Related Knowledge Articles" section
✅ Knowledge article detail → "Related Plants" section
✅ Full bidirectional navigation
