// Generador oficial de comandos para Cobblemon en Minecraft

export interface ExportPokemonData {
  name: string;
  level?: number;
  gender?: "male" | "female" | "genderless";
  shiny?: boolean;
  nature?: string;
  ability?: string;
  item?: string;
  moves?: string[];
  ivs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  evs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
}

export function generatePokegiveCommand(p: ExportPokemonData, targetPlayer: string = "@s"): string {
  const species = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const properties: string[] = [];

  if (p.level) properties.push(`level=${p.level}`);
  if (p.shiny) properties.push(`shiny=true`);
  if (p.nature) properties.push(`nature=${p.nature.toLowerCase()}`);
  if (p.ability) properties.push(`ability=${p.ability.toLowerCase().replace(/\s+/g, "_")}`);
  if (p.gender) properties.push(`gender=${p.gender}`);

  // IVs
  if (p.ivs) {
    const ivStr = `${p.ivs.hp || 31}/${p.ivs.atk || 31}/${p.ivs.def || 31}/${p.ivs.spa || 31}/${p.ivs.spd || 31}/${p.ivs.spe || 31}`;
    properties.push(`ivs=${ivStr}`);
  }

  // EVs
  if (p.evs) {
    const evStr = `${p.evs.hp || 0}/${p.evs.atk || 0}/${p.evs.def || 0}/${p.evs.spa || 0}/${p.evs.spd || 0}/${p.evs.spe || 0}`;
    properties.push(`evs=${evStr}`);
  }

  // Movimientos
  if (p.moves && p.moves.length > 0) {
    const cleanMoves = p.moves
      .filter(Boolean)
      .map((m) => m.toLowerCase().replace(/\s+/g, "_"))
      .join(",");
    if (cleanMoves) properties.push(`moves=${cleanMoves}`);
  }

  // Objeto
  if (p.item) {
    properties.push(`held_item=${p.item.toLowerCase().replace(/\s+/g, "_")}`);
  }

  const propString = properties.length > 0 ? " " + properties.join(" ") : "";
  return `/pokegive ${targetPlayer} ${species}${propString}`;
}

export function generatePokespawnCommand(p: ExportPokemonData): string {
  const species = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const properties: string[] = [];

  if (p.level) properties.push(`level=${p.level}`);
  if (p.shiny) properties.push(`shiny=true`);
  if (p.nature) properties.push(`nature=${p.nature.toLowerCase()}`);

  const propString = properties.length > 0 ? " " + properties.join(" ") : "";
  return `/pokespawn ${species}${propString}`;
}
