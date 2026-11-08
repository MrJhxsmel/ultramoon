import { PokemonData } from "@/types/pokemon";

export interface EnvironmentRecommendation {
  type: string;
  pointsNeeded: number;
  bestBlocks: { block: string; points: number; note: string }[];
}

// Bloques con mayor valor de afecto en Cobblemon por tipo elemental
export const BREEDING_BLOCKS: Record<string, { block: string; points: number; note: string }[]> = {
  fire: [
    { block: "Bloque de Magma", points: 3, note: "Piso o borde" },
    { block: "Fogata de Almas", points: 3, note: "Iluminación" },
    { block: "Lava en Caldero", points: 2, note: "Seguro para granjas" },
    { block: "Roca del Nether", points: 1, note: "Económico" },
  ],
  flying: [
    { block: "Heno (Hay Bale)", points: 2, note: "Ideal para nidos" },
    { block: "Hojas de Árbol", points: 1, note: "Cualquier variante" },
    { block: "Vallas de Madera", points: 1, note: "Perchas elevadas" },
  ],
  ghost: [
    { block: "Arena de Almas", points: 3, note: "Suelo del Nether" },
    { block: "Bloque de Hueso", points: 2, note: "Estructuras" },
    { block: "Calabaza Tallada", points: 2, note: "Decoración" },
  ],
  poison: [
    { block: "Micelio", points: 3, note: "Isla de champiñones" },
    { block: "Bloque de Champiñón", points: 2, note: "Marrón o Rojo" },
    { block: "Verruga del Nether", points: 2, note: "En suelo de almas" },
  ],
  steel: [
    { block: "Yunque (Anvil)", points: 4, note: "Máximo valor" },
    { block: "Bloque de Hierro", points: 3, note: "Base sólida" },
    { block: "Rejilla de Hierro", points: 1, note: "Enrejados" },
  ],
  fighting: [
    { block: "Bloque de Arena", points: 2, note: "Dojo de entrenamiento" },
    { block: "Alfombra Roja", points: 1, note: "Tatami" },
    { block: "Piedra Pulida", points: 1, note: "Plataforma" },
  ],
  dragon: [
    { block: "Bloque de Amatista", points: 4, note: "Geoda subterránea" },
    { block: "Obsidiana", points: 3, note: "Resistente y oscuro" },
    { block: "Piedra del Fin (End Stone)", points: 2, note: "Dimensión del End" },
  ],
  ground: [
    { block: "Tierra Fértil / Fangosa", points: 2, note: "Humedad ideal" },
    { block: "Terracota", points: 2, note: "Cualquier color de Badlands" },
    { block: "Pasto de Camino", points: 1, note: "Sendero" },
  ],
  fairy: [
    { block: "Flor de Cerezo (Pink Petals)", points: 3, note: "Cherry Grove" },
    { block: "Rosa de Wither / Tulipán Rosa", points: 2, note: "Jardín" },
    { block: "Campana de Amatista", points: 2, note: "Sonido místico" },
  ],
  psychic: [
    { block: "Estantería de Libros", points: 3, note: "Biblioteca mágica" },
    { block: "Mesa de Encantamientos", points: 4, note: "Máxima resonancia" },
    { block: "Cristal Tintado Morado", points: 1, note: "Ventanales" },
  ],
  water: [
    { block: "Agua con Algas Marinas", points: 3, note: "Estanque vivo" },
    { block: "Bloque de Coral Vivo", points: 3, note: "Arrecife" },
    { block: "Linterna Marina", points: 2, note: "Iluminación sumergida" },
  ],
  grass: [
    { block: "Hojarasca Florecida", points: 3, note: "Cueva frondosa" },
    { block: "Flores Variadas", points: 2, note: "Jardín completo" },
    { block: "Tierra con Pasto", points: 1, note: "Básico" },
  ],
  electric: [
    { block: "Pararrayos", points: 4, note: "Atracción de energía" },
    { block: "Bloque de Cobre", points: 2, note: "Conductividad" },
    { block: "Lámpara de Redstone", points: 2, note: "Activa con señal" },
  ],
};

export function checkBreedingCompatibility(
  parentA: PokemonData | null,
  parentB: PokemonData | null
) {
  if (!parentA || !parentB) return null;

  // Comprobar si comparten grupo huevo
  const sharedGroups = parentA.eggGroups.filter((g) => parentB.eggGroups.includes(g));
  const isUndiscovered = parentA.eggGroups.includes("Desconocido") || parentB.eggGroups.includes("Desconocido");

  if (isUndiscovered) {
    return {
      compatible: false,
      reason: "Uno de los Pokémon está en el grupo 'Desconocido' (Legendarios/Bebés) y no puede criar.",
      sharedGroups: [],
    };
  }

  if (sharedGroups.length === 0) {
    return {
      compatible: false,
      reason: "No comparten ningún Grupo Huevo compatible.",
      sharedGroups: [],
    };
  }

  // Recolectar requerimientos de bloques para ambos Pokémon
  const typesNeeded = Array.from(new Set([...parentA.types, ...parentB.types]));
  const environmentPlan = typesNeeded.map((t) => ({
    type: t,
    blocks: BREEDING_BLOCKS[t] || [
      { block: "Bloques Temáticos", points: 1, note: "Bloques afines al tipo" },
    ],
  }));

  return {
    compatible: true,
    reason: `¡Son 100% compatibles! Comparten el grupo: ${sharedGroups.join(", ")}.`,
    sharedGroups,
    environmentPlan,
  };
}
