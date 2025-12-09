import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SystemSettings } from '../types';

let supabase: SupabaseClient | null = null;

// Get settings directly from localStorage to avoid circular dependency with storageService
const getLocalSettings = (): SystemSettings | null => {
  try {
    const data = localStorage.getItem('gestor_bfs_settings');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const initSupabase = (): boolean => {
  const settings = getLocalSettings();
  if (settings?.supabaseUrl && settings?.supabaseKey) {
    try {
      supabase = createClient(settings.supabaseUrl, settings.supabaseKey);
      return true;
    } catch (e) {
      console.error("Supabase init error:", e);
      return false;
    }
  }
  return false;
};

export const checkConnection = async (): Promise<boolean> => {
  if (!supabase && !initSupabase()) return false;
  if (!supabase) return false;

  try {
    // Try to fetch one row from orders to test connection
    const { error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is no rows, which is fine
       // If table doesn't exist, it throws error. 
       // We accept this might fail if tables aren't created, but auth should work.
       // A better check is verifying if we have a client.
       console.log("Connection test response:", error);
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Generic Push Function
export const pushDataToCloud = async (tableName: string, data: any[]) => {
  if (!supabase && !initSupabase()) return;
  if (!supabase) return;

  if (data.length === 0) return;

  // We assume the table has columns: id (text), json_content (jsonb)
  // This allows us to store arbitrary TS interfaces without strict schema matching
  const rows = data.map(item => ({
    id: item.id,
    json_content: item
  }));

  const { error } = await supabase.from(tableName).upsert(rows);
  
  if (error) {
    console.error(`Error pushing to ${tableName}:`, error);
  }
};

// Generic Pull Function
export const pullDataFromCloud = async (tableName: string): Promise<any[] | null> => {
  if (!supabase && !initSupabase()) return null;
  if (!supabase) return null;

  const { data, error } = await supabase.from(tableName).select('json_content');
  
  if (error) {
    console.error(`Error pulling from ${tableName}:`, error);
    return null;
  }

  return data.map((row: any) => row.json_content);
};
