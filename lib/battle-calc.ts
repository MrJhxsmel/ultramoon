import { PokemonStats, PokemonType } from "@/types/pokemon";

// Tabla simplificada de efectividades de tipos
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  fire: { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  normal: { rock: 0.5, steel: 0.5, ghost: 0 },
};

// Fórmula oficial de stat competitivo
export function calculateEffectiveSpeed(
  baseSpeed: number,
  level: number = 50,
  evs: number = 252,
  ivs: number = 31,
  natureMultiplier: number = 1.1, // 1.1 si es favorable (+Spe), 1.0 neutra
  hasScarf: boolean = false
): number {
  const rawStat = Math.floor(((2 * baseSpeed + ivs + Math.floor(evs / 4)) * level) / 100) + 5;
  const withNature = Math.floor(rawStat * natureMultiplier);
  return hasScarf ? Math.floor(withNature * 1.5) : withNature;
}

// Calcula multiplicador de daño de un atacante contra un defensor
export function getCrossTypeMultiplier(attackerTypes: PokemonType[], defenderTypes: PokemonType[]): number {
  let bestMultiplier = 1;

  for (const atkType of attackerTypes) {
    let currentMoveMult = 1;
    for (const defType of defenderTypes) {
      const mult = TYPE_CHART[atkType]?.[defType] ?? 1;
      currentMoveMult *= mult;
    }
    if (currentMoveMult > bestMultiplier) {
      bestMultiplier = currentMoveMult;
    }
  }

  return bestMultiplier;
}
