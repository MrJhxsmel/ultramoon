"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Search,
  Box,
  Compass,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface HabitatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon?: (pokemon: PokemonData) => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

// Catálogo enriquecido con referencias directas a IDs para obtener sprites oficiales
const ITEM_DROP_DIRECTORY = [
  {
    item: "Ender Pearl",
    dropRate: "15% - 50%",
    biome: "Cuevas oscuras (Y < 40) y Bosques mágicos",
    pokemonNames: ["Gastly", "Haunter", "Gengar", "Ralts", "Kirlia", "Gardevoir", "Elgyem"],
  },
  {
    item: "Polvo de Blaze (Vara de Llama)",
    dropRate: "35%",
    biome: "Badlands, Tierras Áridas y Nether",
    pokemonNames: ["Charizard", "Magmar", "Magmortar", "Growlithe", "Ponyta", "Torchic"],
  },
  {
    item: "Fragmento de Prismarina",
    dropRate: "25% - 40%",
    biome: "Océanos Profundos, Arrecifes y Playas",
    pokemonNames: ["Tentacool", "Tentacruel", "Staryu", "Starmie", "Corsola", "Chinchou"],
  },
  {
    item: "Polvo de Redstone",
    dropRate: "70%",
    biome: "Montañas Eléctricas y Sabanas",
    pokemonNames: ["Pikachu", "Raichu", "Voltorb", "Electabuzz", "Magnemite", "Electrike"],
  },
  {
    item: "Lingote de Cobre",
    dropRate: "30% - 50%",
    biome: "Cuevas y Cavernas rocosas",
    pokemonNames: ["Geodude", "Graveler", "Aron", "Lairon", "Rolycoly", "Pawniard"],
  },
  {
    item: "Ojo de Araña Fermentado",
    dropRate: "45%",
    biome: "Pantanos y Arrecifes tóxicos",
    pokemonNames: ["Toxapex", "Mareanie", "Spinarak", "Ariados", "Venonat"],
  },
  {
    item: "Hueso de Minecraft",
    dropRate: "65%",
    biome: "Cavernas y Tierras Baldías",
    pokemonNames: ["Cubone", "Marowak", "Houndour", "Duskull", "Yamask"],
  },
  {
    item: "Semillas de Trigo / Calabaza",
    dropRate: "80%",
    biome: "Llanuras floridas y Junglas",
    pokemonNames: ["Oddish", "Bellsprout", "Bulbasaur", "Chikorita", "Cherubi", "Bounsweet"],
  },
];

const BIOMES_LIST = [
  "Todos",
  "Plains (Planicies)",
  "Forest (Bosques)",
  "Mountains (Montañas)",
  "Ocean (Océanos)",
  "Swamp (Pantanos)",
  "Desert (Desiertos)",
  "Jungle (Selvas)",
  "Caves (Cuevas Y < 50)",
];

export function HabitatSearchModal({
  isOpen,
  onClose,
  onSelectPokemon,
}: HabitatSearchModalProps) {
  const [activeTab, setActiveTab] = useState<"drops" | "biomes">("drops"); // Abre en drops por defecto para menor carga inicial
  const [selectedBiome, setSelectedBiome] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Búsqueda bajo demanda (limita a 18 resultados para evitar peticiones masivas)
  const filteredPokemon = useMemo(() => {
    let list = ALL_POKEMON;
    if (selectedBiome !== "Todos") {
      const cleanBiome = selectedBiome.split(" ")[0].toLowerCase();
      list = list.filter((p) =>
        p.biomes?.some((b) => b.toLowerCase().includes(cleanBiome))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toString().includes(q) ||
          p.types.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 18);
  }, [selectedBiome, searchQuery]);

  const filteredDrops = useMemo(() => {
    if (!searchQuery.trim()) return ITEM_DROP_DIRECTORY;
    const q = searchQuery.toLowerCase();
    return ITEM_DROP_DIRECTORY.filter(
      (d) =>
        d.item.toLowerCase().includes(q) ||
        d.biome.toLowerCase().includes(q) ||
        d.pokemonNames.some((p) => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleCardClick = (pokemon: PokemonData) => {
    if (onSelectPokemon) {
      onSelectPokemon(pokemon);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Hábitats & Buscador Inverso de Drops</h2>
                <p className="text-xs text-zinc-400">
                  Haz clic en cualquier Pokémon para ver su ficha completa en la PokéWiki
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de modo y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("drops")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "drops"
                    ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>¿Quién suelta este Objeto?</span>
              </button>

              <button
                onClick={() => setActiveTab("biomes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "biomes"
                    ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Spawns por Bioma</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "drops" ? "Buscar material (Ender Pearl, Cobre...)" : "Filtrar por especie o número..."}
                className="w-full sm:w-72 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* PESTAÑA: DROPS CON SPRITES E IMÁGENES */}
          {activeTab === "drops" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDrops.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Box className="w-4 h-4 text-cyan-400" />
                          {entry.item}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {entry.dropRate}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1.5">
                          Pokémon que lo sueltan (haz clic para abrir ficha):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {entry.pokemonNames.map((pName) => {
                            const foundPoke = ALL_POKEMON.find(
                              (p) => p.name.toLowerCase() === pName.toLowerCase()
                            );

                            return (
                              <button
                                key={pName}
                                onClick={() => foundPoke && handleCardClick(foundPoke)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/10 hover:border-cyan-500/40 text-left transition group cursor-pointer"
                              >
                                {foundPoke && (
                                  <img
                                    src={foundPoke.sprite}
                                    alt={pName}
                                    className="w-6 h-6 object-contain pixelated"
                                    loading="lazy"
                                  />
                                )}
                                <span className="text-xs font-semibold text-zinc-300 group-hover:text-cyan-300 transition">
                                  {pName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{entry.biome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA: BIOMAS INTERACTIVOS (CON CLIC FUNCIONAL) */}
          {activeTab === "biomes" && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {BIOMES_LIST.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBiome(b)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition ${
                      selectedBiome === b
                        ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                        : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredPokemon.map((poke) => (
                  <div
                    key={poke.id + poke.name}
                    onClick={() => handleCardClick(poke)}
                    className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col items-center text-center space-y-1.5 group hover:scale-[1.02]"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <img
                        src={poke.sprite}
                        alt={poke.name}
                        className="w-12 h-12 object-contain drop-shadow"
                        loading="lazy"
                      />
                      <ExternalLink className="w-3 h-3 text-cyan-400 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <span className="text-xs font-bold text-white capitalize truncate w-full group-hover:text-cyan-300 transition">
                      {poke.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">#{poke.id}</span>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {poke.types.map((t) => (
                        <span key={t} className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-white/5 text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
