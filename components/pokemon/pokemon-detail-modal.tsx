"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Award,
  Activity,
  Swords,
  Box,
  Copy,
  Check,
} from "lucide-react";
import type { PokemonData, MoveEntry } from "@/types/pokemon";

interface PokemonDetailModalProps {
  pokemon: PokemonData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  fire: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  water: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  electric: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  grass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  ice: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30",
  fighting: "bg-red-600/20 text-red-300 border-red-600/30",
  poison: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  ground: "bg-yellow-700/20 text-yellow-300 border-yellow-700/30",
  flying: "bg-indigo-400/20 text-indigo-200 border-indigo-400/30",
  psychic: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  bug: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  rock: "bg-amber-800/20 text-amber-200 border-amber-800/30",
  ghost: "bg-violet-800/20 text-violet-300 border-violet-800/30",
  dragon: "bg-indigo-700/20 text-indigo-300 border-indigo-700/30",
  dark: "bg-neutral-800/30 text-neutral-300 border-neutral-600/30",
  steel: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  fairy: "bg-rose-400/20 text-rose-300 border-rose-400/30",
};

export function PokemonDetailModal({
  pokemon,
  isOpen,
  onClose,
}: PokemonDetailModalProps) {
  const [isShiny, setIsShiny] = useState(false);
  const [activeTab, setActiveTab] = useState<"moves" | "stats" | "drops">("moves");
  const [moveFilter, setMoveFilter] = useState<"all" | "level" | "tm" | "egg">("all");
  const [copiedCommand, setCopiedCommand] = useState(false);

  if (!isOpen || !pokemon) return null;

  // Usa directamente stats garantizado
  const currentStats = pokemon.stats;

  const cleanId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const animatedGif = isShiny
    ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${cleanId}.gif`
    : `https://play.pokemonshowdown.com/sprites/ani/${cleanId}.gif`;

  const fallbackSprite = isShiny
    ? pokemon.shinySprite || pokemon.sprite
    : pokemon.sprite;

  const totalStats =
    currentStats.hp +
    currentStats.attack +
    currentStats.defense +
    currentStats.specialAttack +
    currentStats.specialDefense +
    currentStats.speed;

  const movesList: MoveEntry[] = pokemon.moves || [
    { name: "Tackle", type: "normal", category: "Physical", power: 40, accuracy: 100, pp: 35, learnMethod: "level", level: 1 },
    { name: "Protect", type: "normal", category: "Status", power: null, accuracy: null, pp: 10, learnMethod: "tm" },
    { name: "Substitute", type: "normal", category: "Status", power: null, accuracy: null, pp: 10, learnMethod: "tm" },
    { name: "Toxic", type: "poison", category: "Status", power: null, accuracy: 90, pp: 10, learnMethod: "tm" },
    { name: "Double-Edge", type: "normal", category: "Physical", power: 120, accuracy: 100, pp: 15, learnMethod: "egg" },
  ];

  const filteredMoves = movesList.filter((m) =>
    moveFilter === "all" ? true : m.learnMethod === moveFilter
  );

  const handleCopyGive = () => {
    const cmd = `/pokegive @p ${cleanId} shiny=${isShiny} level=50`;
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

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
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-purple-400 font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
              <h2 className="text-xl font-extrabold text-white capitalize tracking-tight">
                {pokemon.name}
              </h2>
              <div className="flex items-center gap-1.5 ml-2">
                {pokemon.types.map((t) => (
                  <span
                    key={t}
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      TYPE_COLORS[t.toLowerCase()] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShiny(!isShiny)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isShiny
                    ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                    : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                }`}
                title="Alternar entre variante Normal y Shiny"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isShiny ? "text-black" : "text-amber-400"}`} />
                <span>{isShiny ? "Shiny Activo" : "Ver Shiny"}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Ventana GIF Pixel */}
              <div className="md:col-span-5 relative rounded-2xl bg-gradient-to-b from-purple-900/20 via-zinc-900/40 to-zinc-950 border border-white/10 flex flex-col items-center justify-center p-6 min-h-[220px]">
                <div
                  className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none ${
                    isShiny ? "bg-amber-400" : "bg-purple-600"
                  }`}
                />

                <img
                  src={animatedGif}
                  alt={pokemon.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackSprite;
                  }}
                  className="relative z-10 w-28 h-28 object-contain drop-shadow-2xl"
                  style={{ imageRendering: "pixelated" }}
                />

                <div className="mt-4 flex items-center gap-2 z-10">
                  <button
                    onClick={handleCopyGive}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400" />}
                    <span>{copiedCommand ? "Comando Copiado" : "/pokegive"}</span>
                  </button>
                </div>
              </div>

              {/* Habilidades y BST */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Habilidades (Cobblemon)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Primaria</span>
                      <span className="text-xs font-bold text-white">{pokemon.abilities.primary}</span>
                    </div>

                    {pokemon.abilities.secondary && (
                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Secundaria</span>
                        <span className="text-xs font-bold text-white">{pokemon.abilities.secondary}</span>
                      </div>
                    )}

                    {pokemon.abilities.hidden && (
                      <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 sm:col-span-2">
                        <span className="text-[10px] text-purple-400 uppercase font-bold block flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Habilidad Oculta (Pasture / Especial)
                        </span>
                        <span className="text-xs font-bold text-purple-200">{pokemon.abilities.hidden}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Total Base (BST)</span>
                    <span className="text-base font-black text-purple-300">{totalStats}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Velocidad Base</span>
                    <span className="text-base font-black text-cyan-300">{currentStats.speed}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Ataque / Sp.Atk</span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {currentStats.attack} / {currentStats.specialAttack}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pestañas */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab("moves")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "moves"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Movimientos</span>
              </button>

              <button
                onClick={() => setActiveTab("stats")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "stats"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Estadísticas</span>
              </button>

              <button
                onClick={() => setActiveTab("drops")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "drops"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Drops de Minecraft</span>
              </button>
            </div>

            {/* Pestaña Movimientos */}
            {activeTab === "moves" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Aprende por Nivel, MT y Huevo:</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    {(["all", "level", "tm", "egg"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setMoveFilter(method)}
                        className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition ${
                          moveFilter === method
                            ? "bg-white/15 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {method === "all" ? "Todos" : method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredMoves.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs hover:border-white/10 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 text-[10px] font-mono text-zinc-500">
                          {m.learnMethod === "level" ? `Nv.${m.level || 1}` : m.learnMethod.toUpperCase()}
                        </span>
                        <span className="font-bold text-white">{m.name}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-semibold ${
                            TYPE_COLORS[m.type.toLowerCase()] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {m.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                        <span>Pot: {m.power ?? "-"}</span>
                        <span>Prec: {m.accuracy ? `${m.accuracy}%` : "-"}</span>
                        <span>PP: {m.pp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña Stats */}
            {activeTab === "stats" && (
              <div className="space-y-3">
                {[
                  { name: "HP", val: currentStats.hp, color: "bg-emerald-500" },
                  { name: "Ataque", val: currentStats.attack, color: "bg-orange-500" },
                  { name: "Defensa", val: currentStats.defense, color: "bg-amber-500" },
                  { name: "Atq. Esp", val: currentStats.specialAttack, color: "bg-cyan-500" },
                  { name: "Def. Esp", val: currentStats.specialDefense, color: "bg-blue-500" },
                  { name: "Velocidad", val: currentStats.speed, color: "bg-pink-500" },
                ].map((stat) => (
                  <div key={stat.name} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-zinc-400 font-semibold">{stat.name}</span>
                    <span className="w-8 font-mono font-bold text-white text-right">{stat.val}</span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stat.color}`}
                        style={{ width: `${Math.min(100, (stat.val / 160) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pestaña Drops */}
            {activeTab === "drops" && (
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 block mb-2">
                  Objetos arrojados al derrotar o atrapar en Minecraft:
                </span>
                {(pokemon.drops || [
                  { item: "Ender Pearl", percentage: 50, quantity: "1-2" },
                  { item: "Cobblemon Exp Candy S", percentage: 100, quantity: "1" },
                ]).map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs"
                  >
                    <span className="font-bold text-zinc-200">{d.item}</span>
                    <div className="flex items-center gap-3 font-mono text-zinc-400">
                      <span>Cantidad: {d.quantity}</span>
                      <span className="text-purple-400 font-bold">{d.percentage}% prob.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
