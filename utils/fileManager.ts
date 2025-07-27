
import { SaveFile } from "../types";

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
