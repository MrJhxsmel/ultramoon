"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Dna,
  Search,
  Compass,
  Swords,
  Shield,
  Zap,
  ShieldAlert,
  Gauge,
  Heart,
  Sun,
  Moon,
  CloudRain,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface EvTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StatCategory = "hp" | "attack" | "defense" | "specialAttack" | "specialDefense" | "speed";

interface EvSpot {
  pokemon: string;
  sprite: string;
  yieldAmount: number;
  stat: StatCategory;
  biomes: string[];
  dimension: "Overworld" | "Nether" | "End";
  timeOfDay: "Día" | "Noche" | "Cualquiera";
  rarity: "Común" | "Poco Común" | "Raro";
  notes?: string;
}

const EV_SPOTS_DATABASE: EvSpot[] = [
  // VELOCIDAD
  {
    pokemon: "Magikarp",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png",
    yieldAmount: 1,
    stat: "speed",
    biomes: ["Ríos", "Océanos", "Playas"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
    notes: "Spawn abundante en agua superficial.",
  },
  {
    pokemon: "Pidgey",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
    yieldAmount: 1,
    stat: "speed",
    biomes: ["Llanuras (Plains)", "Bosques (Forest)"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Común",
  },
  {
    pokemon: "Rattata",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
    yieldAmount: 1,
    stat: "speed",
    biomes: ["Llanuras", "Sabana"],
    dimension: "Overworld",
    timeOfDay: "Noche",
    rarity: "Común",
  },
  {
    pokemon: "Zubat",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
    yieldAmount: 1,
    stat: "speed",
    biomes: ["Cuevas (Y < 60)", "Dripstone Caves"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
    notes: "Aparece en oscuridad bajo tierra.",
  },

  // ATAQUE FÍSICO
  {
    pokemon: "Mankey",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png",
    yieldAmount: 1,
    stat: "attack",
    biomes: ["Montañas (Jagged Peaks)", "Bosques Colinosos"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Común",
  },
  {
    pokemon: "Machop",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png",
    yieldAmount: 1,
    stat: "attack",
    biomes: ["Cuevas", "Montañas Pedregosas"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
  },
  {
    pokemon: "Growlithe",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png",
    yieldAmount: 1,
    stat: "attack",
    biomes: ["Desierto", "Badlands (Mesa)"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Poco Común",
  },
  {
    pokemon: "Ekans",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png",
    yieldAmount: 1,
    stat: "attack",
    biomes: ["Pantanos (Swamp)", "Junglas"],
    dimension: "Overworld",
    timeOfDay: "Noche",
    rarity: "Común",
  },

  // ATAQUE ESPECIAL
  {
    pokemon: "Gastly",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png",
    yieldAmount: 1,
    stat: "specialAttack",
    biomes: ["Bosques Oscuros (Dark Forest)", "Mansiones", "Cementerios"],
    dimension: "Overworld",
    timeOfDay: "Noche",
    rarity: "Común",
    notes: "Solo de noche o en lugares sin luz.",
  },
  {
    pokemon: "Abra",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png",
    yieldAmount: 1,
    stat: "specialAttack",
    biomes: ["Llanuras", "Sabana"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Poco Común",
    notes: "Usa Teletransporte rápido; derrotar a 1 turno.",
  },
  {
    pokemon: "Psyduck",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png",
    yieldAmount: 1,
    stat: "specialAttack",
    biomes: ["Ríos", "Pantanos"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
  },

  // DEFENSA FÍSICA
  {
    pokemon: "Geodude",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png",
    yieldAmount: 1,
    stat: "defense",
    biomes: ["Cuevas", "Montañas", "Badlands"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
  },
  {
    pokemon: "Sandshrew",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
    yieldAmount: 1,
    stat: "defense",
    biomes: ["Desierto", "Badlands"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Común",
  },
  {
    pokemon: "Onix",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png",
    yieldAmount: 1,
    stat: "defense",
    biomes: ["Deepslate Caves (Y < 0)", "Lush Caves"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Poco Común",
  },

  // DEFENSA ESPECIAL
  {
    pokemon: "Tentacool",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png",
    yieldAmount: 1,
    stat: "specialDefense",
    biomes: ["Océanos", "Playas"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
    notes: "Fácil de encontrar navegando en barco.",
  },
  {
    pokemon: "Drowzee",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/96.png",
    yieldAmount: 1,
    stat: "specialDefense",
    biomes: ["Taiga", "Bosques Nevados"],
    dimension: "Overworld",
    timeOfDay: "Noche",
    rarity: "Poco Común",
  },

  // PS (PUNTOS DE SALUD)
  {
    pokemon: "Caterpie",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
    yieldAmount: 1,
    stat: "hp",
    biomes: ["Bosques", "Llanuras"],
    dimension: "Overworld",
    timeOfDay: "Día",
    rarity: "Común",
  },
  {
    pokemon: "Slowpoke",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png",
    yieldAmount: 1,
    stat: "hp",
    biomes: ["Playas", "Costas de Ríos"],
    dimension: "Overworld",
    timeOfDay: "Cualquiera",
    rarity: "Común",
  },
];

const STAT_CONFIG: Record<
  StatCategory,
  { label: string; icon: any; color: string; ringColor: string }
> = {
  speed: { label: "Velocidad", icon: Gauge, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", ringColor: "border-amber-500" },
  attack: { label: "Ataque Físico", icon: Swords, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", ringColor: "border-rose-500" },
  specialAttack: { label: "Ataque Especial", icon: Zap, color: "text-purple-400 bg-purple-500/10 border-purple-500/30", ringColor: "border-purple-500" },
  defense: { label: "Defensa Física", icon: Shield, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", ringColor: "border-emerald-500" },
  specialDefense: { label: "Defensa Especial", icon: ShieldAlert, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", ringColor: "border-cyan-500" },
  hp: { label: "Puntos de Salud (PS)", icon: Heart, color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", ringColor: "border-emerald-400" },
};

export function EvTrackerModal({ isOpen, onClose }: EvTrackerModalProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>("speed");
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "Día" | "Noche">("all");

  const filteredSpots = useMemo(() => {
    return EV_SPOTS_DATABASE.filter((spot) => {
      if (spot.stat !== selectedStat) return false;
      if (timeFilter !== "all" && spot.timeOfDay !== "Cualquiera" && spot.timeOfDay !== timeFilter) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = spot.pokemon.toLowerCase().includes(q);
        const matchesBiome = spot.biomes.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesBiome) return false;
      }
      return true;
    });
  }, [selectedStat, timeFilter, query]);

  if (!isOpen) return null;

  const currentStatConfig = STAT_CONFIG[selectedStat];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Compass className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Guía de Farmeo de EVs por Biomas (Cobblemon)
                </h2>
                <p className="text-xs text-zinc-400">
                  Encuentra los hábitats de Minecraft exactos para maxear cada estadística a 252 EVs
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SELECTOR DE ESTADÍSTICA (6 TABS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-6">
            {(Object.keys(STAT_CONFIG) as StatCategory[]).map((statKey) => {
              const cfg = STAT_CONFIG[statKey];
              const Icon = cfg.icon;
              const isSelected = selectedStat === statKey;

              return (
                <button
                  key={statKey}
                  onClick={() => setSelectedStat(statKey)}
                  className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? `${cfg.color} font-bold shadow-lg shadow-purple-500/10`
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] truncate w-full block">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* FILTROS Y BUSCADOR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar por Pokémon o bioma (ej. Río, Cueva, Badlands)..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Filtro de horario */}
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setTimeFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeFilter === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-400"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTimeFilter("Día")}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                  timeFilter === "Día" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30" : "text-zinc-400"
                }`}
              >
                <Sun className="w-3 h-3" /> Día
              </button>
              <button
                onClick={() => setTimeFilter("Noche")}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                  timeFilter === "Noche" ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30" : "text-zinc-400"
                }`}
              >
                <Moon className="w-3 h-3" /> Noche
              </button>
            </div>
          </div>

          {/* LISTA DE POKÉMON Y BIOMAS RECOMENDADOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 transition flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={spot.sprite}
                      alt={spot.pokemon}
                      className="w-12 h-12 object-contain shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {spot.pokemon}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                          +{spot.yieldAmount} EV
                        </span>
                      </div>

                      {/* Biomas de Minecraft */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {spot.biomes.map((biome, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[10px] text-zinc-300 bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5 text-purple-400" />
                            {biome}
                          </span>
                        ))}
                      </div>

                      {spot.notes && (
                        <p className="text-[10px] text-zinc-500 mt-1 italic">
                          {spot.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges de condición */}
                  <div className="flex flex-col items-end gap-1 shrink-0 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5 font-mono">
                      {spot.rarity}
                    </span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      {spot.timeOfDay === "Día" ? (
                        <>
                          <Sun className="w-3 h-3 text-amber-400" /> Solo Día
                        </>
                      ) : spot.timeOfDay === "Noche" ? (
                        <>
                          <Moon className="w-3 h-3 text-blue-400" /> Solo Noche
                        </>
                      ) : (
                        "Cualquier hora"
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-zinc-500">
                No se encontraron lugares de farmeo con esos filtros.
              </div>
            )}
          </div>

          {/* TIP COMPETITIVO / RESUMEN */}
          <div className="mt-5 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>
              💡 <b>Tip de Entrenamiento:</b> Equipar la <b>Banda Recia</b> o <b>Franja Recia</b> otorga +8 EVs adicionales por cada combate ganado en Minecraft.
            </span>
            <span className="font-mono text-purple-300 font-bold shrink-0 ml-3">
              Total máx: 252 EVs
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
