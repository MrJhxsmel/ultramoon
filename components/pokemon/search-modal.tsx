"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Filter, Globe } from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (pokemon: PokemonData) => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const GENERATIONS = [
  { id: "all", label: "Todas" },
  { id: "gen1", label: "Gen 1 (1-151)", min: 1, max: 151 },
  { id: "gen2", label: "Gen 2 (152-251)", min: 152, max: 251 },
  { id: "gen3", label: "Gen 3 (252-386)", min: 252, max: 386 },
  { id: "gen4", label: "Gen 4 (387-493)", min: 387, max: 493 },
  { id: "gen5", label: "Gen 5 (494-649)", min: 494, max: 649 },
  { id: "gen9", label: "Gen 9 (Paldea)", min: 906, max: 1025 },
];

export function SearchModal({
  isOpen,
  onClose,
  onSelectPokemon,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedGen, setSelectedGen] = useState("all");

  const filteredPokemon = useMemo(() => {
    let list = ALL_POKEMON;

    // Filtro por Generación
    if (selectedGen !== "all") {
      const g = GENERATIONS.find((gen) => gen.id === selectedGen);
      if (g && g.min && g.max) {
        list = list.filter((p) => p.id >= g.min! && p.id <= g.max!);
      }
    }

    // Búsqueda por texto (nombre, id, tipos, biomas)
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toString().includes(q) ||
          p.types.some((t) => t.toLowerCase().includes(q)) ||
          p.biomes?.some((b) => b.toLowerCase().includes(q))
      );
    }

    return list.slice(0, 50);
  }, [query, selectedGen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
        />

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
        >
          {/* Barra de Búsqueda */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-zinc-900/60">
            <Search className="w-5 h-5 text-purple-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por especie, bioma de Minecraft, número o tipo..."
              autoFocus
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros de Generación */}
          <div className="p-2.5 px-4 bg-zinc-900/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            {GENERATIONS.map((gen) => (
              <button
                key={gen.id}
                onClick={() => setSelectedGen(gen.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition shrink-0 ${
                  selectedGen === gen.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {gen.label}
              </button>
            ))}
          </div>

          {/* Lista de Resultados */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredPokemon.map((pokemon) => (
              <button
                key={pokemon.id + "-" + pokemon.name}
                onClick={() => onSelectPokemon(pokemon)}
                className="w-full p-2.5 rounded-2xl flex items-center justify-between text-left hover:bg-white/[0.06] transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={pokemon.sprite} alt={pokemon.name} className="w-9 h-9 object-contain pixelated" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                      {pokemon.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {pokemon.types.join(" / ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pokemon.biomes && pokemon.biomes[0] && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5 hidden sm:inline">
                      {pokemon.biomes[0]}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-purple-400">
                    #{String(pokemon.id).padStart(3, "0")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
