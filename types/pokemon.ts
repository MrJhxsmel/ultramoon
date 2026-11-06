export type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Steel"
  | "Dark"
  | "Fairy"
  | string;

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface MoveEntry {
  name: string;
  type: string;
  category: "Physical" | "Special" | "Status";
  power?: number | null;
  accuracy?: number | null;
  pp: number;
  learnMethod: "level" | "tm" | "egg";
  level?: number;
}

export interface PokemonDrop {
  item: string;
  percentage: number;
  quantity: string;
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  baseStats?: PokemonStats;
  eggGroups: string[];
  biomes: string[];
  catchRate?: number;
  abilities: {
    primary: string;
    secondary?: string;
    hidden?: string;
  };
  sprite: string;
  shinySprite?: string;
  gif?: string;
  shinyGif?: string;
  height?: number;
  weight?: number;
  moves?: MoveEntry[];
  drops?: PokemonDrop[];
  evolutionChain?: string[];
}
