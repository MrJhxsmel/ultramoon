import { PokemonData, PokemonType } from "@/types/pokemon";
import { TYPE_CHART } from "./battle-calc";

export interface MoveData {
  name: string;
  type: PokemonType;
  category: "physical" | "special";
  basePower: number;
}

export const SAMPLE_MOVES: MoveData[] = [
  { name: "Llamarada (Fire Blast)", type: "fire", category: "special", basePower: 110 },
  { name: "Lanzallamas (Flamethrower)", type: "fire", category: "special", basePower: 90 },
  { name: "Bola Sombra (Shadow Ball)", type: "ghost", category: "special", basePower: 80 },
  { name: "Bomba Lodo (Sludge Bomb)", type: "poison", category: "special", basePower: 90 },
  { name: "Aura Esfera (Aura Sphere)", type: "fighting", category: "special", basePower: 80 },
  { name: "Puño Meteoro (Meteor Mash)", type: "steel", category: "physical", basePower: 90 },
  { name: "Terremoto (Earthquake)", type: "ground", category: "physical", basePower: 100 },
  { name: "Garra Dragón (Dragon Claw)", type: "dragon", category: "physical", basePower: 80 },
  { name: "Fuerza Lunar (Moonblast)", type: "fairy", category: "special", basePower: 95 },
];

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  isOHKO: boolean;
  is2HKO: boolean;
  typeMultiplier: number;
  isSTAB: boolean;
}

export function calculateDamage(
  attacker: PokemonData,
  defender: PokemonData,
  move: MoveData,
  weather: "none" | "sun" | "rain" = "none",
  attackerHasBoostItem: boolean = false // ej. Vidasfera / Life Orb (1.3x)
): DamageResult {
  const level = 50;

  // Selección de stats (físico vs especial)
  const attackStat = move.category === "physical" ? attacker.stats.attack : attacker.stats.specialAttack;
  const defenseStat = move.category === "physical" ? defender.stats.defense : defender.stats.specialDefense;

  // Cálculo de PS reales del defensor a Nivel 50 (con 31 IVs y 0 EVs base)
  const defenderMaxHP = Math.floor(((2 * defender.stats.hp + 31) * level) / 100) + level + 10;

  // 1. STAB (Same Type Attack Bonus: x1.5 si el Pokémon comparte tipo con el movimiento)
  const isSTAB = attacker.types.includes(move.type);
  const stabMultiplier = isSTAB ? 1.5 : 1.0;

  // 2. Efectividad de tipo cruzada
  let typeMultiplier = 1;
  for (const defType of defender.types) {
    const factor = TYPE_CHART[move.type]?.[defType] ?? 1;
    typeMultiplier *= factor;
  }

  // 3. Modificador de Clima
  let weatherMultiplier = 1;
  if (weather === "sun") {
    if (move.type === "fire") weatherMultiplier = 1.5;
    if (move.type === "water") weatherMultiplier = 0.5;
  } else if (weather === "rain") {
    if (move.type === "water") weatherMultiplier = 1.5;
    if (move.type === "fire") weatherMultiplier = 0.5;
  }

  // 4. Modificador de Objeto
  const itemMultiplier = attackerHasBoostItem ? 1.3 : 1.0;

  // Daño Base oficial
  const baseDamage = Math.floor(
    (Math.floor((Math.floor((2 * level) / 5 + 2) * move.basePower * attackStat) / defenseStat) / 50) + 2
  );

  const modifiers = stabMultiplier * typeMultiplier * weatherMultiplier * itemMultiplier;

  // Rango aleatorio de daño competitivo (de 85% a 100%)
  const minDamage = Math.floor(baseDamage * 0.85 * modifiers);
  const maxDamage = Math.floor(baseDamage * 1.0 * modifiers);

  const minPercent = Number(((minDamage / defenderMaxHP) * 100).toFixed(1));
  const maxPercent = Number(((maxDamage / defenderMaxHP) * 100).toFixed(1));

  return {
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    isOHKO: minPercent >= 100,
    is2HKO: minPercent * 2 >= 100,
    typeMultiplier,
    isSTAB,
  };
}
