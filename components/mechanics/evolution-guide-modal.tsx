"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Search,
  Box,
  Compass,
  Heart,
  Flame,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  Layers,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface EvolutionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EvolutionCategory = "block" | "item" | "friendship" | "dimension" | "special";

interface SpecialEvolution {
  basePokemon: string;
  baseId: number;
  baseSprite: string;
  evolvesTo: string;
  evolvedSprite: string;
  category: EvolutionCategory;
  methodTitle: string;
  minecraftRequirement: string;
  detail: string;
}

const SPECIAL_EVOLUTIONS: SpecialEvolution[] = [
  {
    basePokemon: "Eevee",
    baseId: 133,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
    evolvesTo: "Glaceon",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png",
    category: "block",
    methodTitle: "Cerca de Hielo Compacto / Hielo Azul",
    minecraftRequirement: "Subir 1 nivel a menos de 10 bloques de Hielo Compacto o Hielo Azul.",
    detail: "También funciona exponiéndolo a una Piedra Hielo en el inventario.",
  },
  {
    basePokemon: "Eevee",
    baseId: 133,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
    evolvesTo: "Leafeon",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/470.png",
    category: "block",
    methodTitle: "Cerca de Bloque de Musgo",
    minecraftRequirement: "Subir 1 nivel a menos de 10 bloques de un Bloque de Musgo en cualquier bioma.",
    detail: "O utilizando una Piedra Hoja directamente.",
  },
  {
    basePokemon: "Magneton",
    baseId: 82,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png",
    evolvesTo: "Magnezone",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png",
    category: "block",
    methodTitle: "Campo Magnético de Minecraft",
    minecraftRequirement: "Subir 1 nivel cerca de una Magnetita (Lodestone) o Bloque de Hierro.",
    detail: "También evoluciona con una Piedra Trueno.",
  },
  {
    basePokemon: "Nosepass",
    baseId: 299,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/299.png",
    evolvesTo: "Probopass",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/476.png",
    category: "block",
    methodTitle: "Atracción de Magnetita",
    minecraftRequirement: "Subir 1 nivel a menos de 10 bloques de una Magnetita.",
    detail: "Similar a Magnezone, aprovecha la polaridad del bloque en Minecraft.",
  },
  {
    basePokemon: "Charcadet",
    baseId: 935,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/935.png",
    evolvesTo: "Armarouge",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/936.png",
    category: "item",
    methodTitle: "Armadura Auspiciosa",
    minecraftRequirement: "Usar Armadura Auspiciosa (crafteada con Fragmentos de Bronzor).",
    detail: "Evolución exclusiva con estadísticas orientadas a Ataque Especial.",
  },
  {
    basePokemon: "Charcadet",
    baseId: 935,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/935.png",
    evolvesTo: "Ceruledge",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/937.png",
    category: "item",
    methodTitle: "Armadura Maldita",
    minecraftRequirement: "Usar Armadura Maldita (crafteada con Fragmentos de Sinistea).",
    detail: "Evolución orientada a Ataque Físico con movimiento Espada Lamento.",
  },
  {
    basePokemon: "Riolu",
    baseId: 447,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/447.png",
    evolvesTo: "Lucario",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png",
    category: "friendship",
    methodTitle: "Amistad Alta de Día",
    minecraftRequirement: "Felicidad >= 220 y subir nivel durante el Día de Minecraft.",
    detail: "Equipar Campana Alivio y alimentar con bayas dulces acelera el proceso.",
  },
  {
    basePokemon: "Pichu",
    baseId: 172,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png",
    evolvesTo: "Pikachu",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    category: "friendship",
    methodTitle: "Felicidad en Cobblemon",
    minecraftRequirement: "Alcanzar 220+ de Amistad y subir 1 nivel.",
    detail: "Caminar con el Pokémon fuera de la Poké Ball aumenta la felicidad cada ciertos pasos.",
  },
  {
    basePokemon: "Haunter",
    baseId: 93,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png",
    evolvesTo: "Gengar",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
    category: "item",
    methodTitle: "Cordón Unión (Link Cable)",
    minecraftRequirement: "Usar un Cordón Unión (Link Cable) en lugar de intercambiar.",
    detail: "En Cobblemon no es obligatorio tradear; el Link Cable simula el intercambio tradicional.",
  },
  {
    basePokemon: "Machoke",
    baseId: 67,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png",
    evolvesTo: "Machamp",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
    category: "item",
    methodTitle: "Cordón Unión (Link Cable)",
    minecraftRequirement: "Usar un Cordón Unión directamente sobre el Machoke.",
    detail: "Resuelve las evoluciones de intercambio en mundos single-player y servidores.",
  },
  {
    basePokemon: "Kadabra",
    baseId: 64,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png",
    evolvesTo: "Alakazam",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
    category: "item",
    methodTitle: "Cordón Unión (Link Cable)",
    minecraftRequirement: "Usar Cordón Unión sobre Kadabra.",
    detail: "Evolución instantánea sin perder movimientos aprendidos.",
  },
  {
    basePokemon: "Graveler",
    baseId: 75,
    baseSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png",
    evolvesTo: "Golem",
    evolvedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png",
    category: "item",
    methodTitle: "Cordón Unión (Link Cable)",
    minecraftRequirement: "Usar Cordón Unión sobre Graveler.",
    detail: "Aplica tanto a la forma de Kanto como a la de Alola.",
  },
];

const CATEGORY_TABS: { id: "all" | EvolutionCategory; label: string; icon: any }[] = [
  { id: "all", label: "Todas", icon: Layers },
  { id: "block", label: "Por Bloques", icon: Box },
  { id: "item", label: "Objetos & Cable", icon: Sparkles },
  { id: "friendship", label: "Amistad", icon: Heart },
];

export function EvolutionGuideModal({ isOpen, onClose }: EvolutionGuideModalProps) {
  const [category, setCategory] = useState<"all" | EvolutionCategory>("all");
  const [query, setQuery] = useState("");

  const filteredEvolutions = useMemo(() => {
    return SPECIAL_EVOLUTIONS.filter((evo) => {
      if (category !== "all" && evo.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesBase = evo.basePokemon.toLowerCase().includes(q);
        const matchesTarget = evo.evolvesTo.toLowerCase().includes(q);
        const matchesReq = evo.minecraftRequirement.toLowerCase().includes(q);
        if (!matchesBase && !matchesTarget && !matchesReq) return false;
      }
      return true;
    });
  }, [category, query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Guía de Evoluciones Especiales de Minecraft
                </h2>
                <p className="text-xs text-zinc-400">
                  Métodos adaptados a Cobblemon: Bloques cercanos, Link Cable y Amistad
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

          {/* Filtros y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por Pokémon o método (ej. Eevee, Magnetita, Link Cable)..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCategory(tab.id)}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      isSelected
                        ? "bg-orange-500 text-black font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Evoluciones Especiales */}
          <div className="space-y-3">
            {filteredEvolutions.length > 0 ? (
              filteredEvolutions.map((evo, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-orange-500/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Visual del cambio evolutivo */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-center">
                      <img
                        src={evo.baseSprite}
                        alt={evo.basePokemon}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-[11px] font-bold text-zinc-300">
                        {evo.basePokemon}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />

                    <div className="flex flex-col items-center">
                      <img
                        src={evo.evolvedSprite}
                        alt={evo.evolvesTo}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-[11px] font-bold text-white">
                        {evo.evolvesTo}
                      </span>
                    </div>
                  </div>

                  {/* Descripción del método de Minecraft */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-300">
                        {evo.methodTitle}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                        {evo.category}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 font-medium">
                      {evo.minecraftRequirement}
                    </p>

                    <p className="text-[11px] text-zinc-500">
                      {evo.detail}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500">
                No se encontraron métodos de evolución con ese filtro.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
