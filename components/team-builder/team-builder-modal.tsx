"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  ShieldAlert,
  Swords,
  ChevronRight,
  Terminal,
  Save,
  Cloud,
  Lock,
  ArrowRightLeft,
  QrCode,
  FileCode,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExportCommandsModal } from "./export-commands-modal";
import { AuthModal } from "@/components/auth/auth-modal";

interface PokemonSlot {
  id: number;
  name: string;
  types: string[];
  role?: string;
  ability?: string;
  nature?: string;
  item?: string;
  moves?: string[];
  evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  shiny?: boolean;
  level?: number;
}

const DEFAULT_TEAM_PRESET: PokemonSlot[] = [
  {
    id: 445,
    name: "Garchomp",
    types: ["Dragon", "Ground"],
    role: "Physical Sweeper",
    ability: "Rough Skin",
    nature: "Jolly",
    item: "Life Orb",
    moves: ["Earthquake", "Dragon Claw", "Swords Dance", "Protect"],
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 50,
  },
  {
    id: 6,
    name: "Charizard",
    types: ["Fire", "Flying"],
    role: "Special Attacker",
    ability: "Solar Power",
    nature: "Timid",
    item: "Choice Specs",
    moves: ["Heat Wave", "Air Slash", "Solar Beam", "Focus Blast"],
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 50,
  },
];

const AVAILABLE_POKEMON_SEARCH = [
  { id: 1, name: "Bulbasaur", types: ["Grass", "Poison"] },
  { id: 2, name: "Ivysaur", types: ["Grass", "Poison"] },
  { id: 3, name: "Venusaur", types: ["Grass", "Poison"] },
  { id: 4, name: "Charmander", types: ["Fire"] },
  { id: 5, name: "Charmeleon", types: ["Fire"] },
  { id: 6, name: "Charizard", types: ["Fire", "Flying"] },
  { id: 7, name: "Squirtle", types: ["Water"] },
  { id: 8, name: "Wartortle", types: ["Water"] },
  { id: 9, name: "Blastoise", types: ["Water"] },
  { id: 94, name: "Gengar", types: ["Ghost", "Poison"] },
  { id: 130, name: "Gyarados", types: ["Water", "Flying"] },
  { id: 143, name: "Snorlax", types: ["Normal"] },
  { id: 248, name: "Tyranitar", types: ["Rock", "Dark"] },
  { id: 282, name: "Gardevoir", types: ["Psychic", "Fairy"] },
  { id: 445, name: "Garchomp", types: ["Dragon", "Ground"] },
  { id: 448, name: "Lucario", types: ["Fighting", "Steel"] },
  { id: 658, name: "Greninja", types: ["Water", "Dark"] },
  { id: 778, name: "Mimikyu", types: ["Ghost", "Fairy"] },
  { id: 887, name: "Dragapult", types: ["Dragon", "Ghost"] },
  { id: 987, name: "Flutter Mane", types: ["Ghost", "Fairy"] },
  { id: 1007, name: "Koraidon", types: ["Fighting", "Dragon"] },
  { id: 1008, name: "Miraidon", types: ["Electric", "Dragon"] },
];

export function TeamBuilderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"team" | "matchups" | "balance" | "pc">("team");
  const [teamName, setTeamName] = useState("Equipo Competitivo VGC");
  const [team, setTeam] = useState<PokemonSlot[]>(DEFAULT_TEAM_PRESET);
  const [pcBox, setPcBox] = useState<PokemonSlot[]>([
    { id: 1, name: "Bulbasaur", types: ["Grass", "Poison"], level: 50 },
    { id: 4, name: "Charmander", types: ["Fire"], level: 50 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isExportCmdOpen, setIsExportCmdOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingCloud, setSavingCloud] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user ?? null));
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => authSub.subscription.unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleAddPokemon = (poke: { id: number; name: string; types: string[] }) => {
    if (team.length >= 6) {
      alert("El equipo titular ya tiene 6 Pokémon.");
      return;
    }
    const newSlot: PokemonSlot = {
      id: poke.id,
      name: poke.name,
      types: poke.types,
      level: 50,
      nature: "Hardy",
      moves: ["Tackle", "Protect"],
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    };
    setTeam([...team, newSlot]);
  };

  const handleRemovePokemon = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const handleMoveToBox = (slot: PokemonSlot, index: number) => {
    setPcBox([...pcBox, slot]);
    handleRemovePokemon(index);
  };

  const handleMoveToTeam = (slot: PokemonSlot, index: number) => {
    if (team.length >= 6) {
      alert("El equipo titular ya está lleno (máximo 6 Pokémon).");
      return;
    }
    setTeam([...team, slot]);
    setPcBox(pcBox.filter((_, i) => i !== index));
  };

  const handleSaveToCloud = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSavingCloud(true);
    try {
      const { error } = await supabase.from("user_teams").upsert(
        {
          user_id: currentUser.id,
          team_name: teamName,
          pokemon_list: team,
          matchup_strategies: [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert("Error al guardar equipo en la nube: " + err.message);
    } finally {
      setSavingCloud(false);
    }
  };

  const filteredPokes = AVAILABLE_POKEMON_SEARCH.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Fondo oscuro desenfocado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Superior */}
          <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-transparent text-base font-black text-white focus:outline-none focus:border-b border-purple-500"
                  />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {team.length}/6 Pokémon
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Tablero integral: armado 6v6, planes de enfrentamiento y exportación de comandos
                </p>
              </div>
            </div>

            {/* Acciones de la barra superior */}
            <div className="flex items-center gap-2">
              {/* Botón Guardar en Nube */}
              <button
                onClick={handleSaveToCloud}
                disabled={savingCloud}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  savedSuccess
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : !currentUser
                    ? "bg-zinc-800/80 border-amber-500/30 text-amber-300 hover:bg-zinc-800"
                    : "bg-purple-600 hover:bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-600/20"
                }`}
                title={!currentUser ? "Inicia sesión para guardar en la nube" : "Guardar en Supabase"}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                    {!currentUser && (
                      <span className="px-1 text-[8px] bg-amber-400 text-black font-black rounded">
                        LOGIN
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Botón Comandos Cobblemon */}
              <button
                onClick={() => {
                  if (!currentUser) setIsAuthOpen(true);
                  else setIsExportCmdOpen(true);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  !currentUser
                    ? "bg-zinc-800/80 border-amber-500/30 text-amber-300 hover:bg-zinc-800"
                    : "bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/40 text-purple-200 shadow-md shadow-purple-600/20"
                }`}
                title={!currentUser ? "Inicia sesión para exportar comandos" : "Exportar comandos /pokegive"}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>/pokegive</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NUEVO
                </span>
                {!currentUser && (
                  <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-black">
                    LOGIN
                  </span>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="px-5 border-b border-white/5 flex gap-2 pt-3 shrink-0 bg-zinc-900/30">
            {[
              { id: "team", label: "Alineación 6v6", icon: Users },
              { id: "matchups", label: "Planes de Enfrentamiento (Matchups)", icon: Swords },
              { id: "balance", label: "Balance & Puntos Ciegos", icon: ShieldAlert },
              { id: "pc", label: `Caja PC (${pcBox.length})`, icon: Cloud },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition border-b-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-300 bg-white/5"
                      : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
            {/* PESTAÑA 1: ALINEACIÓN 6V6 */}
            {activeTab === "team" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 6 Ranuras de Pokémon */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const member = team[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition relative flex flex-col justify-between min-h-[170px] ${
                          member
                            ? "bg-zinc-900/70 border-white/10 hover:border-purple-500/40"
                            : "bg-zinc-900/20 border-dashed border-white/10 flex items-center justify-center text-zinc-500"
                        }`}
                      >
                        {member ? (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.id}.png`}
                                  alt={member.name}
                                  className="w-14 h-14 object-contain drop-shadow"
                                />
                                <div>
                                  <h4 className="text-sm font-black text-white">{member.name}</h4>
                                  <div className="flex gap-1 mt-1">
                                    {member.types.map((t) => (
                                      <span
                                        key={t}
                                        className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveToBox(member, idx)}
                                  className="p-1 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-white/5 transition"
                                  title="Enviar a Caja PC"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemovePokemon(idx)}
                                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition"
                                  title="Eliminar de la alineación"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-1 text-[10px] text-zinc-400">
                              <span className="font-mono bg-black/40 px-2 py-0.5 rounded">
                                {member.item || "Sin Objeto"}
                              </span>
                              <span className="font-mono bg-black/40 px-2 py-0.5 rounded">
                                {member.ability || "Sin Habilidad"}
                              </span>
                              <span className="font-mono bg-black/40 px-2 py-0.5 rounded">
                                {member.nature || "Hardy"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center space-y-1">
                            <Plus className="w-6 h-6 mx-auto opacity-30" />
                            <span className="text-xs font-semibold opacity-40">Slot #{idx + 1} Libre</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Buscador de Especies Rápido */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-3 flex flex-col h-[400px]">
                  <h4 className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Añadir a la Alineación</span>
                    <span className="text-[10px] text-zinc-400">{filteredPokes.length} especies</span>
                  </h4>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar especie (ej. Lucario, Gengar)..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                  />
                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {filteredPokes.map((poke) => (
                      <button
                        key={poke.id}
                        onClick={() => handleAddPokemon(poke)}
                        className="w-full p-2 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 flex items-center justify-between transition text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`}
                            alt={poke.name}
                            className="w-8 h-8 object-contain"
                          />
                          <div>
                            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                              {poke.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono block">
                              #{poke.id}
                            </span>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: PLANES DE ENFRENTAMIENTO */}
            {activeTab === "matchups" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  ✦ Define tu plan de juego frente a los núcleos más comunes del meta de Cobblemon.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      archetype: "Lluvia Agresiva (Rain Offense)",
                      threat: "Pelipper + Archaludon / Kingdra",
                      advice:
                        "Abrir con control de terreno eléctrico o clima opuesto (Sol de Charizard / Torkoal). Evitar que Archaludon acumule subidas de Electroshot.",
                    },
                    {
                      archetype: "Espacio Raro (Trick Room)",
                      threat: "Indeedee + Armarouge / Ursaluna",
                      advice:
                        "Llevar Mofa o sellar con Imprison. Cambiar a tipos Volador/Levitación si Ursaluna entra con Llamasfera activa.",
                    },
                    {
                      archetype: "Core Balance FWG",
                      threat: "Fuego / Agua / Planta estándar",
                      advice:
                        "Explotar cobertura Dragón y Tierra con Garchomp para forzar cambios defensivos continuos.",
                    },
                  ].map((m, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{m.archetype}</h4>
                        <span className="text-[10px] font-mono text-purple-400">AMENAZA ALTA</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-200">Núcleo Rival:</strong> {m.threat}
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                        {m.advice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: BALANCE & CORES */}
            {activeTab === "balance" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white">Sinergias Elementales Detectadas</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Core FWG (Fuego/Agua/Planta)</span>
                      <p className="text-emerald-400 font-bold">Activo (Resistencias circulares)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Core DSF (Dragón/Acero/Hada)</span>
                      <p className="text-purple-400 font-bold">Parcial (Requiere Hada)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Inmunidades Terrestres</span>
                      <p className="text-cyan-400 font-bold">1 Tipo Volador detectado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: CAJA PC (STORAGE BOX) */}
            {activeTab === "pc" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    Suplentes en Reserva ({pcBox.length} Pokémon)
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Guarda aquí variantes para cambiar en torneos
                  </span>
                </div>
                {pcBox.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-12">
                    Tu caja PC está vacía. Envía Pokémon desde la alineación para guardarlos de reserva.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {pcBox.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt={p.name}
                            className="w-10 h-10 object-contain"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white">{p.name}</h5>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Nivel {p.level || 50}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMoveToTeam(p, idx)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Al Equipo</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de Comandos /pokegive */}
        <ExportCommandsModal
          isOpen={isExportCmdOpen}
          onClose={() => setIsExportCmdOpen(false)}
          teamName={teamName}
          pokemonList={team}
        />

        {/* Modal de Login de Respaldo */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </AnimatePresence>
  );
}
