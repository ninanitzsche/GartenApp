#!/usr/bin/env ts-node

/**
 * Backfill scheduled_date for existing AI tasks
 * Sets scheduled_date based on zeitraum for tasks created from AI
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const zeitraumMap: Record<string, string> = {
  'winter_mitte': '01-15', 'winter_spaet': '02-15', 'fruehjahr_frueh': '03-15',
  'fruehjahr_mitte': '04-15', 'fruehjahr_spaet': '05-15', 'sommer_frueh': '06-15',
  'sommer_mitte': '07-15', 'sommer_spaet': '08-15', 'herbst_frueh': '09-15',
  'herbst_mitte': '10-15', 'herbst_spaet': '11-15', 'winter_frueh': '12-15',
  'flexibel': '06-15',
};

async function backfillScheduledDates() {
  console.log('Fetching ALL tasks...');

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, zeitraum, scheduled_date, created_at');

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log(`Found ${tasks?.length || 0} tasks to update`);

  const now = new Date();
  const year = now.getFullYear();
  let updated = 0;

  for (const task of tasks || []) {
    let scheduledDate: string | null = null;

    // Use zeitraum if available
    if (task.zeitraum) {
      const dayMonth = zeitraumMap[task.zeitraum];
      if (dayMonth) {
        let dateStr = `${year}-${dayMonth}`;
        const target = new Date(dateStr);
        if (target < now) {
          dateStr = `${year + 1}-${dayMonth}`;
        }
        scheduledDate = dateStr;
      }
    }

    // Fallback: use created_at
    if (!scheduledDate) {
      scheduledDate = task.created_at.split('T')[0];
    }

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ scheduled_date: scheduledDate })
      .eq('id', task.id);

    if (updateError) {
      console.error(`Failed to update task ${task.id}:`, updateError);
    } else {
      updated++;
      if (updated % 50 === 0) {
        console.log(`Updated ${updated} tasks...`);
      }
    }
  }

  console.log(`Done! Updated ${updated} tasks`);
}

backfillScheduledDates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
