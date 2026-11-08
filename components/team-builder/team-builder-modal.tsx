"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Share2,
  Download,
  Search,
  Sparkles,
  Shield,
  Swords,
  Users,
  Terminal,
  Save,
  Layers,
  ArrowRightLeft,
  Crosshair,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BattleCoachTab } from "./battle-coach-tab";

interface PokemonSlot {
  id?: string;
  name: string;
  types: string[];
  item?: string;
  ability?: string;
  nature?: string;
  level?: number;
  moves?: any[];
}

export function TeamBuilderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"team" | "coach" | "matchups" | "balance">("team");
  const [teamName, setTeamName] = useState("Equipo Competitivo VGC");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Equipo inicial (como el que se muestra en tus capturas)
  const [team, setTeam] = useState<PokemonSlot[]>([
    {
      name: "Garchomp",
      types: ["Dragon", "Ground"],
      item: "Life Orb",
      ability: "Rough Skin",
      nature: "Jolly",
      level: 50,
    },
    {
      name: "Charizard",
      types: ["Fire", "Flying"],
      item: "Choice Specs",
      ability: "Solar Power",
      nature: "Timid",
      level: 50,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const POKEMON_CATALOG: PokemonSlot[] = [
    { name: "Garchomp", types: ["Dragon", "Ground"], item: "Life Orb", ability: "Rough Skin", nature: "Jolly", level: 50 },
    { name: "Charizard", types: ["Fire", "Flying"], item: "Choice Specs", ability: "Solar Power", nature: "Timid", level: 50 },
    { name: "Graveler", types: ["Rock", "Ground"], item: "Eviolite", ability: "Sturdy", nature: "Adamant", level: 50 },
    { name: "Alakazam", types: ["Psychic"], item: "Focus Sash", ability: "Magic Guard", nature: "Timid", level: 50 },
    { name: "Salamence", types: ["Dragon", "Flying"], item: "Lum Berry", ability: "Intimidate", nature: "Naive", level: 50 },
    { name: "Gigalith", types: ["Rock"], item: "Leftovers", ability: "Sand Stream", nature: "Brave", level: 50 },
    { name: "Kilowattrel", types: ["Electric", "Flying"], item: "Booster Energy", ability: "Wind Power", nature: "Timid", level: 50 },
    { name: "Lucario", types: ["Fighting", "Steel"], item: "Life Orb", ability: "Inner Focus", nature: "Jolly", level: 50 },
    { name: "Gengar", types: ["Ghost", "Poison"], item: "Choice Scarf", ability: "Cursed Body", nature: "Timid", level: 50 },
    { name: "Tyranitar", types: ["Rock", "Dark"], item: "Assault Vest", ability: "Sand Stream", nature: "Adamant", level: 50 },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });
  }, []);

  const addPokemonToTeam = (poke: PokemonSlot) => {
    if (team.length >= 6) return;
    setTeam((prev) => [...prev, poke]);
    setSearchQuery("");
  };

  const removePokemonFromTeam = (index: number) => {
    setTeam((prev) => prev.filter((_, idx) => idx !== index));
  };

  const filteredCatalog = POKEMON_CATALOG.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b0e14] border border-white/10 text-zinc-100 shadow-2xl overflow-hidden"
        >
          {/* Cabecera */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="text-base sm:text-xl font-black bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                    {team.length}/6 Pokémon
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Tablero integral: armado 6v6, asistente táctico de batalla y análisis de coberturas
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-white/5 overflow-x-auto shrink-0 custom-scrollbar">
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "team"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Alineación 6v6</span>
            </button>

            <button
              onClick={() => setActiveTab("coach")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "coach"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-purple-300" />
              <span>Asistente de Batalla</span>
            </button>

            <button
              onClick={() => setActiveTab("matchups")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "matchups"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Planes de Enfrentamiento</span>
            </button>

            <button
              onClick={() => setActiveTab("balance")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === "balance"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Balance & Coberturas</span>
            </button>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
            {activeTab === "coach" && (
              <BattleCoachTab team={team} />
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                {/* Cuadrícula de 6 Slots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const poke = team[idx];

                    if (poke) {
                      return (
                        <div
                          key={poke.name + idx}
                          className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-start justify-between gap-4 group hover:border-purple-500/40 transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-purple-400 shrink-0">
                              {poke.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white">{poke.name}</h4>
                                <div className="flex gap-1">
                                  {poke.types.map((t) => (
                                    <span
                                      key={t}
                                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 mt-2 font-mono">
                                {poke.item && <span className="bg-white/5 px-2 py-0.5 rounded">{poke.item}</span>}
                                {poke.ability && <span className="bg-white/5 px-2 py-0.5 rounded">{poke.ability}</span>}
                                {poke.nature && <span className="bg-white/5 px-2 py-0.5 rounded">{poke.nature}</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removePokemonFromTeam(idx)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/5 text-zinc-400 hover:text-rose-400 transition"
                            title="Quitar Pokémon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`empty-${idx}`}
                        className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center gap-1.5 opacity-50"
                      >
                        <Plus className="w-5 h-5 text-zinc-500" />
                        <span className="text-xs font-semibold text-zinc-400">Slot #{idx + 1} Libre</span>
                      </div>
                    );
                  })}
                </div>

                {/* Buscador de Especies para Añadir */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase font-bold text-purple-400">
                      Añadir Pokémon al Equipo
                    </h4>
                    <span className="text-xs text-zinc-500 font-mono">
                      {filteredCatalog.length} especies
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar especie (ej. Lucario, Gengar, Charizard)..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredCatalog.map((poke) => (
                      <button
                        key={poke.name}
                        onClick={() => addPokemonToTeam(poke)}
                        disabled={team.length >= 6}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/40 text-left transition flex items-center justify-between group disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-300">
                          {poke.name}
                        </span>
                        <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "matchups" && (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <Crosshair className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">
                  Selecciona la pestaña <strong>Asistente de Batalla</strong> para calcular turnos contra tu oponente en Minecraft.
                </p>
              </div>
            )}

            {activeTab === "balance" && (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <Shield className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">
                  Tu equipo cubre los núcleos elementales básicos. Consulta la efectividad directa en el Asistente de Batalla.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}