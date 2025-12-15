import { createClient } from '@supabase/supabase-js';
import { DataItem } from '../types';

// Using provided credentials directly to ensure connection
const supabaseUrl = 'https://tsckfiwskqkekhkqunrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY2tmaXdza3FrZWtoa3F1bnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjE5OTQsImV4cCI6MjA4MTMzNzk5NH0.5IYQNroz7fuEOHrlFbj31Y74k-npgOKBpd5LMwn_VYY';

export const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'entries';

/**
 * Subscribes to changes in the Supabase table and keeps the local state in sync.
 */
export const subscribeToData = (
  onData: (items: DataItem[]) => void, 
  onError: (error: Error) => void
) => {
  // 1. Function to fetch all data and map it to our types
  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedItems: DataItem[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        value: Number(row.value),
        category: row.category,
        createdAt: row.created_at
      }));

      onData(mappedItems);
    } catch (err: any) {
      onError(new Error(err.message || 'Failed to fetch data'));
    }
  };

  // 2. Perform initial fetch
  fetchAll();

  // 3. Subscribe to real-time changes
  const channel = supabase
    .channel('table_db_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
      },
      (payload) => {
        // Optimistic update or simple re-fetch. Re-fetch is safer for consistency in this scale.
        fetchAll(); 
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        onError(new Error("Real-time connection error"));
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Adds a single item to Supabase
 */
export const addItem = async (item: Omit<DataItem, 'id' | 'createdAt'>) => {
  const { error } = await supabase.from(TABLE_NAME).insert({
    name: item.name,
    value: item.value,
    category: item.category,
    // created_at is handled by default now() in SQL
  });
  
  if (error) throw error;
};

/**
 * Deletes a single item from Supabase
 */
export const deleteItem = async (id: string) => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
  if (error) throw error;
};

/**
 * Adds multiple items to Supabase
 */
export const addBulkItems = async (newItems: Omit<DataItem, 'id' | 'createdAt'>[]) => {
  // Map to snake_case column names if necessary, though here they match mostly.
  const records = newItems.map(item => ({
    name: item.name,
    value: item.value,
    category: item.category
  }));

  const { error } = await supabase.from(TABLE_NAME).insert(records);
  if (error) throw error;
};

/**
 * Deletes multiple items by ID.
 * Using specific IDs is safer and more reliable than generic bulk deletes.
 */
export const clearAllItems = async (ids: string[]) => {
  if (!ids || ids.length === 0) return;

  // Batch delete to handle URL length limits if there are many items
  const BATCH_SIZE = 20;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(TABLE_NAME).delete().in('id', batch);
    if (error) throw error;
  }
};