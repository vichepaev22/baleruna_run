const SAVE_KEY = 'cappuccina_save';

export interface SaveData {
  selectedCharacter: string;
  maxLevel: number;
  levelStars: number[];
  levelScores: number[];
  totalRolls: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  tutorialDone: boolean;
}

const defaultSave: SaveData = {
  selectedCharacter: 'cappuccina',
  maxLevel: 1,
  levelStars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  levelScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  totalRolls: 0,
  musicEnabled: true,
  sfxEnabled: true,
  tutorialDone: false
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...defaultSave };
    const data = JSON.parse(raw) as Partial<SaveData>;
    return { ...defaultSave, ...data };
  } catch {
    return { ...defaultSave };
  }
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function completeLevel(levelIndex: number, stars: number, score: number, rolls: number, save: SaveData): SaveData {
  const newSave = { ...save };
  newSave.levelStars = [...save.levelStars];
  newSave.levelScores = [...save.levelScores];
  
  if (stars > newSave.levelStars[levelIndex]) {
    newSave.levelStars[levelIndex] = stars;
  }
  if (score > newSave.levelScores[levelIndex]) {
    newSave.levelScores[levelIndex] = score;
  }
  if (levelIndex + 1 >= newSave.maxLevel && levelIndex + 1 < 10) {
    newSave.maxLevel = levelIndex + 2;
  }
  newSave.totalRolls += rolls;
  
  saveSave(newSave);
  return newSave;
}
