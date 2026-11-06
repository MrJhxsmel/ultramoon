import fs from "fs";
import path from "path";

const OUTPUT_FILE = path.join(process.cwd(), "data", "cobblemon-pokedex.json");

// Biomas típicos de Minecraft por tipo elemental en Cobblemon
const BIOME_MAP: Record<string, string[]> = {
  fire: ["Nether Basalt Deltas", "Badlands", "Desierto"],
  water: ["Océano Profundo", "Ríos", "Playas"],
  grass: ["Llanuras", "Bosque de Robles", "Jungla"],
  electric: ["Picos Pedregosos", "Sabana", "Cimas de Montañas"],
  ice: ["Picos Helados", "Océano Congelado", "Taiga Nevada"],
  fighting: ["Montañas", "Dojos", "Badlands"],
  poison: ["Pantano", "Manglares", "Cuevas Fangosas"],
  ground: ["Desierto", "Badlands", "Cuevas Subterráneas"],
  flying: ["Colinas de Viento", "Bosques", "Picos Altos"],
  psychic: ["Praderas de Cerezos", "Bosque Floral", "Estructuras Antiguas"],
  bug: ["Bosques Densos", "Jungla", "Taiga"],
  rock: ["Cuevas de Goteo", "Cañones", "Montañas Pedregosas"],
  ghost: ["Bosque Oscuro (Dark Forest)", "Fortalezas del Nether", "Deep Dark"],
  dragon: ["Picos Extremos", "Dimensión del End", "Cuevas Profundas"],
  steel: ["Cuevas Subterráneas (Cobre/Hierro)", "Montañas Altas"],
  dark: ["Bosque Oscuro", "Deep Dark", "Minas Abandonadas"],
  fairy: ["Praderas de Cerezos (Cherry Grove)", "Bosque Floral"],
  normal: ["Llanuras", "Bosques Templados", "Colinas"],
};

async function fetchFromCloud() {
  console.log("☁️  Descargando datos oficiales de Pokémon y Cobblemon...");

  try {
    // Descarga el listado de especies (Gen 1 hasta Gen 9)
    const LIMIT = 1025; // Primeras generaciones competitivas principales
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}`);
    if (!res.ok) {
      throw new Error(`Error en el servidor: ${res.status}`);
    }

    const json = await res.json();
    const results = json.results;

    console.log(`📡 Se obtuvieron ${results.length} especies. Procesando stats y mecánicas...`);

    const pokedex: any[] = [];
    const BATCH_SIZE = 20;

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (item: { name: string; url: string }) => {
          try {
            const detailRes = await fetch(item.url);
            if (!detailRes.ok) return;

            const data = await detailRes.json();

            // Tipos
            const types = data.types.map((t: any) => t.type.name);

            // Estadísticas
            const statsMap: Record<string, number> = {};
            data.stats.forEach((s: any) => {
              statsMap[s.stat.name] = s.base_stat;
            });

            // Habilidades
            let primaryAbility = "Desconocida";
            let hiddenAbility: string | undefined = undefined;

            data.abilities.forEach((ab: any) => {
              if (ab.is_hidden) {
                hiddenAbility = ab.ability.name.replace(/-/g, " ");
              } else if (primaryAbility === "Desconocida") {
                primaryAbility = ab.ability.name.replace(/-/g, " ");
              }
            });

            // Mapeo automático de biomas de Cobblemon según tipos
            const mainType = types[0];
            const biomes = BIOME_MAP[mainType] || ["Biomas Templados de Minecraft"];

            pokedex.push({
              id: data.id,
              name: data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/-/g, " "),
              types,
              stats: {
                hp: statsMap["hp"] || 50,
                attack: statsMap["attack"] || 50,
                defense: statsMap["defense"] || 50,
                specialAttack: statsMap["special-attack"] || 50,
                specialDefense: statsMap["special-defense"] || 50,
                speed: statsMap["speed"] || 50,
              },
              biomes,
              eggGroups: ["Campo", "Monstruo"], // Estándar para simulación de crianza
              abilities: {
                primary: primaryAbility,
                hidden: hiddenAbility,
              },
              sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
            });
          } catch {
            // Ignorar errores puntuales de red
          }
        })
      );

      process.stdout.write(`\r📥 Progreso: ${Math.min(i + BATCH_SIZE, results.length)} / ${results.length}`);
    }

    // Ordenar numéricamente por Pokédex (#1, #2, #3...)
    pokedex.sort((a, b) => a.id - b.id);

    // Guardar archivo final
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pokedex, null, 2), "utf-8");

    console.log(`\n✅ ¡Descarga completada con éxito!`);
    console.log(`📊 Total de Pokémon importados: ${pokedex.length}`);
    console.log(`📁 Guardado en: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("\n❌ Error al sincronizar con la nube:", error);
  }
}

fetchFromCloud();
