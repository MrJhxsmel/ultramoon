"use client";

import React, { useState, useMemo } from "react";
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
  Globe,
} from "lucide-react";
import type { PokemonData, MoveEntry, PokemonDrop } from "@/types/pokemon";

interface PokemonDetailModalProps {
  pokemon: PokemonData | null;
  isOpen: boolean;
  onClose: () => void;
}

// Catálogo de Formas Regionales
interface RegionalVariant {
  region: "Alola" | "Galar" | "Hisui" | "Paldea";
  types: string[];
  abilities: { primary: string; secondary?: string; hidden?: string };
  stats: { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
  spriteSuffix: string;
}

const REGIONAL_FORMS: Record<string, RegionalVariant[]> = {
  ninetales: [
    {
      region: "Alola",
      types: ["Ice", "Fairy"],
      abilities: { primary: "Snow Cloak", hidden: "Snow Warning" },
      stats: { hp: 73, attack: 67, defense: 75, specialAttack: 81, specialDefense: 100, speed: 109 },
      spriteSuffix: "-alola",
    },
  ],
  raichu: [
    {
      region: "Alola",
      types: ["Electric", "Psychic"],
      abilities: { primary: "Surge Surfer" },
      stats: { hp: 60, attack: 85, defense: 50, specialAttack: 95, specialDefense: 85, speed: 110 },
      spriteSuffix: "-alola",
    },
  ],
  marowak: [
    {
      region: "Alola",
      types: ["Fire", "Ghost"],
      abilities: { primary: "Cursed Body", secondary: "Lightning Rod", hidden: "Rock Head" },
      stats: { hp: 60, attack: 80, defense: 110, specialAttack: 50, specialDefense: 80, speed: 45 },
      spriteSuffix: "-alola",
    },
  ],
  weezing: [
    {
      region: "Galar",
      types: ["Poison", "Fairy"],
      abilities: { primary: "Levitate", secondary: "Neutralizing Gas", hidden: "Misty Surge" },
      stats: { hp: 65, attack: 90, defense: 120, specialAttack: 85, specialDefense: 70, speed: 60 },
      spriteSuffix: "-galar",
    },
  ],
  zoroark: [
    {
      region: "Hisui",
      types: ["Normal", "Ghost"],
      abilities: { primary: "Illusion" },
      stats: { hp: 55, attack: 100, defense: 60, specialAttack: 125, specialDefense: 60, speed: 110 },
      spriteSuffix: "-hisui",
    },
  ],
  arcanine: [
    {
      region: "Hisui",
      types: ["Fire", "Rock"],
      abilities: { primary: "Intimidate", secondary: "Flash Fire", hidden: "Rock Head" },
      stats: { hp: 95, attack: 115, defense: 80, specialAttack: 95, specialDefense: 80, speed: 90 },
      spriteSuffix: "-hisui",
    },
  ],
};

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
  const [selectedVariant, setSelectedVariant] = useState<RegionalVariant | null>(null);
  const [activeTab, setActiveTab] = useState<"moves" | "stats" | "drops">("moves");
  const [copiedCommand, setCopiedCommand] = useState(false);

  if (!isOpen || !pokemon) return null;

  const cleanName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const variants = REGIONAL_FORMS[cleanName] || [];

  const currentTypes = selectedVariant ? selectedVariant.types : pokemon.types;
  const currentStats = selectedVariant ? selectedVariant.stats : (pokemon.stats || pokemon.baseStats);
  const currentAbilities = selectedVariant ? selectedVariant.abilities : pokemon.abilities;

  const spriteId = selectedVariant ? `${cleanName}${selectedVariant.spriteSuffix}` : cleanName;
  const animatedGif = isShiny
    ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${spriteId}.gif`
    : `https://play.pokemonshowdown.com/sprites/ani/${spriteId}.gif`;

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

  const handleCopyGive = () => {
    const formParam = selectedVariant ? ` form=${selectedVariant.region.toLowerCase()}` : "";
    const cmd = `/pokegive @p ${cleanName} level=50 shiny=${isShiny}${formParam}`;
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
          className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-purple-400 font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
              <h2 className="text-xl font-extrabold text-white capitalize tracking-tight">
                {pokemon.name} {selectedVariant && `(${selectedVariant.region})`}
              </h2>
              <div className="flex items-center gap-1.5 ml-2">
                {currentTypes.map((t) => (
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
              >
                <Sparkles className={`w-3.5 h-3.5 ${isShiny ? "text-black" : "text-amber-400"}`} />
                <span>{isShiny ? "Shiny Activo" : "Ver Shiny"}</span>
              </button>

              <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selector de Forma Regional (Si aplica) */}
          {variants.length > 0 && (
            <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-white/5 flex items-center gap-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400 font-semibold text-[11px]">Forma Regional:</span>
              <button
                onClick={() => setSelectedVariant(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedVariant === null ? "bg-purple-600 text-white font-bold" : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Estándar
              </button>
              {variants.map((v) => (
                <button
                  key={v.region}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedVariant?.region === v.region ? "bg-cyan-600 text-white font-bold" : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  Forma {v.region}
                </button>
              ))}
            </div>
          )}

          {/* Cuerpo */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5 relative rounded-2xl bg-gradient-to-b from-purple-900/20 via-zinc-900/40 to-zinc-950 border border-white/10 flex flex-col items-center justify-center p-6 min-h-[220px]">
                <img
                  src={animatedGif}
                  alt={pokemon.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackSprite;
                  }}
                  className="relative z-10 w-28 h-28 object-contain pixelated drop-shadow-2xl"
                  style={{ imageRendering: "pixelated" }}
                />

                <div className="mt-4 flex items-center gap-2 z-10">
                  <button
                    onClick={handleCopyGive}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400" />}
                    <span>{copiedCommand ? "Copiado" : "/pokegive"}</span>
                  </button>
                </div>
              </div>

              {/* Habilidades y Estadísticas */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Habilidades Oficiales
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Primaria</span>
                      <span className="text-xs font-bold text-white">{currentAbilities.primary}</span>
                    </div>

                    {currentAbilities.secondary && (
                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Secundaria</span>
                        <span className="text-xs font-bold text-white">{currentAbilities.secondary}</span>
                      </div>
                    )}

                    {currentAbilities.hidden && (
                      <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 sm:col-span-2">
                        <span className="text-[10px] text-purple-400 uppercase font-bold block flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Habilidad Oculta
                        </span>
                        <span className="text-xs font-bold text-purple-200">{currentAbilities.hidden}</span>
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

            {/* Pestaña Estadísticas */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Distribución de Estadísticas Base:
              </span>
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
