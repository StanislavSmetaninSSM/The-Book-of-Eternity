
import { SaveFile, DBSaveSlotInfo } from "../types";

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export function saveGameToFile(saveData: SaveFile, t: TFunction): void {
  try {
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-rpg-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error saving game file:', err);
    alert(t('Could not save the game file.'));
  }
}

export function saveConfigurationToFile(configData: any, t: TFunction): void {
  try {
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-rpg-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error saving configuration file:', err);
    alert(t('Could not save the configuration file.'));
  }
}

export function loadGameFromFile(t: TFunction): Promise<SaveFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    let fileSelected = false; // Flag to prevent race condition

    const cleanup = () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      window.removeEventListener('focus', handleFocus);
    };

    const handleFocus = () => {
      // If focus returns to the window quickly, it's likely the dialog was cancelled.
      // We add a timeout to give the 'change' event a chance to fire and set the flag.
      setTimeout(() => {
        if (!fileSelected) {
          console.log('Load operation cancelled by user.');
          cleanup();
          resolve(null);
        }
      }, 500);
    };
    
    window.addEventListener('focus', handleFocus, { once: true });

    input.onchange = (event: Event) => {
      fileSelected = true; // Signal that a file was selected
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const contents = e.target?.result as string;
            if (contents) {
              const data = JSON.parse(contents) as SaveFile;
              // Basic validation
              if (data && data.gameContext && data.gameState) {
                resolve(data);
              } else {
                alert(t('Invalid save file format.'));
                resolve(null);
              }
            } else {
               resolve(null);
            }
          } catch (err) {
            console.error('Error parsing save file:', err);
            alert(t('Could not read or parse the save file.'));
            resolve(null);
          } finally {
            cleanup();
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert(t('Could not read the file.'));
          cleanup();
          resolve(null);
        };
        reader.readAsText(file);
      } else {
        cleanup();
        resolve(null); // No file selected
      }
    };

    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  });
}

export function loadConfigurationFromFile(t: TFunction): Promise<any | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    let fileSelected = false; // Flag to prevent race condition

    const cleanup = () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      window.removeEventListener('focus', handleFocus);
    };

    const handleFocus = () => {
      // If focus returns to the window quickly, it's likely the dialog was cancelled.
      // We add a timeout to give the 'change' event a chance to fire and set the flag.
      setTimeout(() => {
        if (!fileSelected) {
          console.log('Load operation cancelled by user.');
          cleanup();
          resolve(null);
        }
      }, 500);
    };
    
    window.addEventListener('focus', handleFocus, { once: true });

    input.onchange = (event: Event) => {
      fileSelected = true; // Signal that a file was selected
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const contents = e.target?.result as string;
            if (contents) {
              const data = JSON.parse(contents);
              // Basic validation for config file
              if (data && data.universe && data.playerName !== undefined && !data.gameContext && !data.gameState) {
                resolve(data);
              } else {
                alert(t('Invalid configuration file format.'));
                resolve(null);
              }
            } else {
               resolve(null);
            }
          } catch (err) {
            console.error('Error parsing configuration file:', err);
            alert(t('Could not read or parse the configuration file.'));
            resolve(null);
          } finally {
            cleanup();
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert(t('Could not read the file.'));
          cleanup();
          resolve(null);
        };
        reader.readAsText(file);
      } else {
        cleanup();
        resolve(null); // No file selected
      }
    };

    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  });
}

// --- IndexedDB ---

const DB_NAME = 'gemini-rpg-db';
const DB_VERSION = 2;
const AUTOSAVE_STORE_NAME = 'autosaves';
const SLOTS_STORE_NAME = 'save_slots';
const AUTOSAVE_ID = 'current_autosave';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SLOTS_STORE_NAME)) {
          db.createObjectStore(SLOTS_STORE_NAME, { keyPath: 'slotId' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };
    });
  }
  return dbPromise;
}

// --- Autosave Functions ---

export async function saveToDB(saveData: SaveFile): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(AUTOSAVE_STORE_NAME);
    const dataToStore = { id: AUTOSAVE_ID, saveData };
    store.put(dataToStore);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        console.error('IndexedDB save transaction error:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
    throw error;
  }
}

export async function loadFromDB(): Promise<SaveFile | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(AUTOSAVE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(AUTOSAVE_STORE_NAME);
    const request = store.get(AUTOSAVE_ID);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.saveData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        console.error('Failed to load from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return null;
  }
}

export async function getAutosaveTimestampFromDB(): Promise<string | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(AUTOSAVE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(AUTOSAVE_STORE_NAME);
    const request = store.get(AUTOSAVE_ID);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result && request.result.saveData) {
          resolve(request.result.saveData.timestamp);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        console.error('Failed to get timestamp from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get timestamp from IndexedDB:', error);
    return null;
  }
}

// --- Save Slot Functions ---

export async function saveToDBSlot(slotId: number, saveData: SaveFile): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(SLOTS_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(SLOTS_STORE_NAME);
  store.put({ slotId, saveData });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function loadFromDBSlot(slotId: number): Promise<SaveFile | null> {
  const db = await openDB();
  const transaction = db.transaction(SLOTS_STORE_NAME, 'readonly');
  const store = transaction.objectStore(SLOTS_STORE_NAME);
  const request = store.get(slotId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result?.saveData || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDBSlot(slotId: number): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(SLOTS_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(SLOTS_STORE_NAME);
  store.delete(slotId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function listDBSlots(): Promise<DBSaveSlotInfo[]> {
  const db = await openDB();
  const transaction = db.transaction(SLOTS_STORE_NAME, 'readonly');
  const store = transaction.objectStore(SLOTS_STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const slots: DBSaveSlotInfo[] = request.result.map(item => ({
        slotId: item.slotId,
        timestamp: item.saveData.timestamp,
        playerName: item.saveData.gameState.playerCharacter.name,
        playerLevel: item.saveData.gameState.playerCharacter.level,
        locationName: item.saveData.gameState.currentLocationData.name,
        turnNumber: item.saveData.gameContext.currentTurnNumber,
      }));
      resolve(slots.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    };
    request.onerror = () => reject(request.error);
  });
}
