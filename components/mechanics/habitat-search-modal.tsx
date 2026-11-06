"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Map,
  Search,
  MapPin,
  Sun,
  Moon,
  CloudRain,
  Compass,
  Layers,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface HabitatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpawnData {
  pokemonId: number;
  biomes: string[];
  dimension: "Overworld" | "Nether" | "End";
  weatherCondition: "Despejado" | "Lluvia" | "Tormenta" | "Cualquiera";
  timeCondition: "Día" | "Noche" | "Cualquiera";
  yLevel: string;
  rarity: "Común" | "Poco Común" | "Raro" | "Ultra Raro";
  blocks: string[];
  notes?: string;
}

const SPAWN_DATABASE: Record<number, SpawnData> = {
  1: { pokemonId: 1, biomes: ["Bosques de Robles", "Llanuras templadas"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Día", yLevel: "Y > 60", rarity: "Poco Común", blocks: ["Bloques de Pasto", "Musgo"], notes: "Suele aparecer cerca de fuentes de agua dulce." },
  4: { pokemonId: 4, biomes: ["Badlands (Mesa)", "Desierto", "Montañas Pedregosas"], dimension: "Overworld", weatherCondition: "Despejado", timeCondition: "Día", yLevel: "Y > 70", rarity: "Poco Común", blocks: ["Arena Roja", "Terracota", "Piedra"], notes: "Mayor probabilidad en biomas cálidos y secos." },
  7: { pokemonId: 7, biomes: ["Playas", "Costas de Ríos", "Océanos Cálidos"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Cualquiera", yLevel: "Y = 62 (Nivel del mar)", rarity: "Poco Común", blocks: ["Arena", "Grava", "Agua"], notes: "Spawnea sumergido o en la orilla de la costa." },
  10: { pokemonId: 10, biomes: ["Bosques de Robles", "Taiga"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Día", yLevel: "Y > 60", rarity: "Común", blocks: ["Pasto", "Hojas"] },
  13: { pokemonId: 13, biomes: ["Bosques de Abedul", "Bosques Oscuros"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Día", yLevel: "Y > 60", rarity: "Común", blocks: ["Pasto", "Hojas"] },
  16: { pokemonId: 16, biomes: ["Llanuras", "Bosques"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Día", yLevel: "Y > 62", rarity: "Común", blocks: ["Pasto"] },
  19: { pokemonId: 19, biomes: ["Llanuras", "Sabana"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Noche", yLevel: "Y > 60", rarity: "Común", blocks: ["Pasto", "Tierra árida"] },
  23: { pokemonId: 23, biomes: ["Pantanos", "Junglas"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Noche", yLevel: "Y > 60", rarity: "Común", blocks: ["Pasto", "Lodo"] },
  25: { pokemonId: 25, biomes: ["Bosques", "Llanuras de Girasoles"], dimension: "Overworld", weatherCondition: "Tormenta", timeCondition: "Cualquiera", yLevel: "Y > 64", rarity: "Raro", blocks: ["Pasto"], notes: "Tasa de aparición duplicada durante tormentas eléctricas." },
  27: { pokemonId: 27, biomes: ["Desierto", "Badlands"], dimension: "Overworld", weatherCondition: "Despejado", timeCondition: "Día", yLevel: "Y > 60", rarity: "Común", blocks: ["Arena", "Arenisca"] },
  41: { pokemonId: 41, biomes: ["Cuevas (Dripstone)", "Minas Abandonadas"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Cualquiera", yLevel: "Y < 50", rarity: "Común", blocks: ["Piedra", "Deepslate"], notes: "Requiere nivel de luz 0." },
  74: { pokemonId: 74, biomes: ["Montañas", "Cuevas"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Cualquiera", yLevel: "Y < 70", rarity: "Común", blocks: ["Piedra"] },
  92: { pokemonId: 92, biomes: ["Bosques Oscuros (Dark Forest)", "Cementerios"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Noche", yLevel: "Y > 60", rarity: "Poco Común", blocks: ["Pasto", "Piedra labrada"], notes: "Aparece únicamente de noche en superficie." },
  95: { pokemonId: 95, biomes: ["Deepslate Caves", "Lush Caves"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Cualquiera", yLevel: "Y < 0", rarity: "Raro", blocks: ["Deepslate", "Toba volcánica"], notes: "Requiere espacio vertical amplio para spawnear." },
  129: { pokemonId: 129, biomes: ["Ríos", "Océanos", "Pantanos"], dimension: "Overworld", weatherCondition: "Cualquiera", timeCondition: "Cualquiera", yLevel: "Y < 64", rarity: "Común", blocks: ["Agua"] },
};

function getRarityBadgeColor(rarity: SpawnData["rarity"]) {
  switch (rarity) {
    case "Ultra Raro":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Raro":
      return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    case "Poco Común":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    default:
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
}

export function HabitatSearchModal({ isOpen, onClose }: HabitatSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-foco al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedPokemon(null);
    }
  }, [isOpen]);

  // Sugerencias rápidas basadas en el texto (máximo 6 para que vuele)
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  // Datos de spawn del Pokémon actualmente seleccionado
  const currentSpawn = useMemo(() => {
    if (!selectedPokemon) return null;
    return (
      SPAWN_DATABASE[selectedPokemon.id] || {
        pokemonId: selectedPokemon.id,
        biomes: ["Llanuras", "Bosques Templados"],
        dimension: "Overworld" as const,
        weatherCondition: "Cualquiera" as const,
        timeCondition: "Cualquiera" as const,
        yLevel: "Y > 55",
        rarity: "Común" as const,
        blocks: ["Pasto", "Tierra"],
        notes: "Aparición estándar en biomas de superficie.",
      }
    );
  }, [selectedPokemon]);

  if (!isOpen) return null;

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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Buscador de Hábitats en Minecraft
                </h2>
                <p className="text-xs text-zinc-400">
                  Escribe el nombre del Pokémon para consultar sus condiciones de spawn
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

          {/* BUSCADOR SPOTLIGHT */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedPokemon && e.target.value !== selectedPokemon.name) {
                  setSelectedPokemon(null);
                }
              }}
              placeholder="Escribe el Pokémon que deseas buscar (ej. Charmander, Pikachu)..."
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400 transition"
            />

            {/* Menú flotante de coincidencias rápidas mientras escribe */}
            {query.trim() && !selectedPokemon && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-20 p-2 space-y-1">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPokemon(p);
                      setQuery(p.name);
                    }}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between hover:bg-white/[0.06] text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.sprite} alt={p.name} className="w-8 h-8 object-contain shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-teal-300">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {p.types.join(" / ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">#{p.id}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ESTADO 1: NINGÚN POKÉMON SELECCIONADO (ESTADO INICIAL LIGERO) */}
          {!selectedPokemon && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-500">
                <Compass className="w-6 h-6 text-teal-400/60" />
              </div>
              <div className="space-y-1 max-w-sm">
                <span className="text-xs font-bold text-zinc-300 block">
                  Sin Pokémon seleccionado
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Busca una especie arriba para ver sus biomas de Minecraft, horarios, bloques de suelo y tasas de rareza sin sobrecargar el juego.
                </p>
              </div>

              {/* Botones de prueba rápida */}
              <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                {SAMPLE_POKEMON.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPokemon(p);
                      setQuery(p.name);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[11px] text-zinc-400 hover:text-white transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ESTADO 2: FICHA DE HÁBITAT CARGADA BAJO DEMANDA */}
          {selectedPokemon && currentSpawn && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5"
            >
              {/* Encabezado del Pokémon */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center p-1.5">
                    <img
                      src={selectedPokemon.sprite}
                      alt={selectedPokemon.name}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500">#{selectedPokemon.id}</span>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                        {selectedPokemon.name}
                      </h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getRarityBadgeColor(
                          currentSpawn.rarity
                        )}`}
                      >
                        {currentSpawn.rarity}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {selectedPokemon.types.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPokemon(null);
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="text-xs text-teal-400 hover:underline font-medium"
                >
                  Cambiar
                </button>
              </div>

              {/* Biomas de Minecraft */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Biomas Donde Aparece:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSpawn.biomes.map((biome, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-zinc-200 bg-zinc-900 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-teal-400" />
                      {biome}
                    </span>
                  ))}
                </div>
              </div>

              {/* Condiciones de Entorno en Minecraft */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Dimensión</span>
                  <span className="font-semibold text-zinc-200">{currentSpawn.dimension}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Altura (Y)</span>
                  <span className="font-mono font-semibold text-teal-300">{currentSpawn.yLevel}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Horario</span>
                  <span className="font-semibold text-zinc-200 flex items-center gap-1">
                    {currentSpawn.timeCondition === "Día" ? (
                      <>
                        <Sun className="w-3 h-3 text-amber-400" /> Día
                      </>
                    ) : currentSpawn.timeCondition === "Noche" ? (
                      <>
                        <Moon className="w-3 h-3 text-blue-400" /> Noche
                      </>
                    ) : (
                      "Cualquiera"
                    )}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Clima</span>
                  <span className="font-semibold text-zinc-200">{currentSpawn.weatherCondition}</span>
                </div>
              </div>

              {/* Bloques de Soporte */}
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Bloques sobre los que aparece:</span>
                <span className="font-mono font-medium text-zinc-200">
                  {currentSpawn.blocks.join(" • ")}
                </span>
              </div>

              {/* Notas de spawn */}
              {currentSpawn.notes && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
                  💡 <b>Condición especial:</b> {currentSpawn.notes}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
