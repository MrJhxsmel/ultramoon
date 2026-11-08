import { PokemonData, PokemonType } from "@/types/pokemon";
import { TYPE_CHART } from "./battle-calc";

export const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "steel", "dark", "fairy",
];

export interface TypeDefensiveProfile {
  type: PokemonType;
  weaknesses: number;  // Cuántos miembros reciben x2 o x4
  resistances: number; // Cuántos miembros reciben x0.5 o x0.25
  immunities: number;  // Cuántos miembros reciben x0
}

// Calcula la efectividad de un tipo atacante contra los tipos de un Pokémon defensor
export function getDefensiveMultiplier(incomingType: PokemonType, defenderTypes: PokemonType[]): number {
  let mult = 1;
  for (const defType of defenderTypes) {
    const factor = TYPE_CHART[incomingType]?.[defType] ?? 1;
    mult *= factor;
  }
  return mult;
}

// Analiza todo el equipo de hasta 6 miembros
export function analyzeTeamSynergy(team: PokemonData[]): {
  matrix: TypeDefensiveProfile[];
  criticalWeaknesses: PokemonType[];
} {
  const matrix: TypeDefensiveProfile[] = ALL_TYPES.map((type) => {
    let weak = 0;
    let resist = 0;
    let immune = 0;

    for (const member of team) {
      const mult = getDefensiveMultiplier(type, member.types);
      if (mult > 1) weak++;
      else if (mult === 0) immune++;
      else if (mult < 1) resist++;
    }

    return {
      type,
      weaknesses: weak,
      resistances: resist,
      immunities: immune,
    };
  });

  // Alertas críticas: 3 o más debilidades con 0 inmunidades y 0 o 1 resistencia
  const criticalWeaknesses = matrix
    .filter((m) => m.weaknesses >= 3 && m.immunities === 0 && m.resistances <= 1)
    .map((m) => m.type);

  return { matrix, criticalWeaknesses };
}
