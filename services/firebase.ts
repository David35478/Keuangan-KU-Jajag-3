import { DataItem } from '../types';

const STORAGE_KEY = 'adminSum_items';

// Simple observer pattern to trigger updates within the app
type Listener = (items: DataItem[]) => void;
const listeners: Listener[] = [];

// Helper to get data from local storage
const getItems = (): DataItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Sort by createdAt desc (newest first)
    const items = JSON.parse(raw) as DataItem[];
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error("Error reading local storage", e);
    return [];
  }
};

// Helper to save data and notify listeners
const saveItems = (items: DataItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach(listener => listener(items));
};

/**
 * Subscribes to changes (simulates Firestore onSnapshot)
 */
export const subscribeToData = (
  onData: (items: DataItem[]) => void, 
  onError: (error: Error) => void
) => {
  // Initial load
  try {
    const items = getItems();
    onData(items);
  } catch (e) {
    onError(e as Error);
  }

  // Add listener
  listeners.push(onData);

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(onData);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Adds a single item to Local Storage
 */
export const addItem = async (item: Omit<DataItem, 'id' | 'createdAt'>) => {
  const items = getItems();
  const newItem: DataItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  // Add to beginning of array
  saveItems([newItem, ...items]);
};

/**
 * Deletes a single item from Local Storage
 */
export const deleteItem = async (id: string) => {
  const items = getItems();
  const filtered = items.filter(i => i.id !== id);
  saveItems(filtered);
};

/**
 * Adds multiple items to Local Storage
 */
export const addBulkItems = async (newItems: Omit<DataItem, 'id' | 'createdAt'>[]) => {
  const items = getItems();
  const formattedItems: DataItem[] = newItems.map(item => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  }));
  saveItems([...formattedItems, ...items]);
};

/**
 * Deletes all items
 */
export const clearAllItems = async () => {
  saveItems([]);
};
