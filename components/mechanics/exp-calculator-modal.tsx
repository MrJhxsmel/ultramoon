"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  Sparkles,
  Calculator,
  Search,
  Zap,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface ExpCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

// Fórmulas oficiales de Experiencia en Pokémon
function getExpForLevel(level: number, rate: string = "medium-fast"): number {
  if (level <= 1) return 0;
  switch (rate) {
    case "fast":
      return Math.floor((4 * Math.pow(level, 3)) / 5);
    case "medium-slow":
      return Math.floor((6 / 5) * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level - 140);
    case "slow":
      return Math.floor((5 * Math.pow(level, 3)) / 4);
    case "medium-fast":
    default:
      return Math.floor(Math.pow(level, 3));
  }
}

const CANDY_TYPES = [
  { name: "Caramelo Exp XS", exp: 100 },
  { name: "Caramelo Exp S", exp: 800 },
  { name: "Caramelo Exp M", exp: 3000 },
  { name: "Caramelo Exp L", exp: 10000 },
  { name: "Caramelo Exp XL", exp: 30000 },
];

export function ExpCalculatorModal({ isOpen, onClose }: ExpCalculatorModalProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData>(ALL_POKEMON[0]);
  const [startLevel, setStartLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState("");

  const availablePokemon = useMemo(() => {
    if (!searchQuery.trim()) return ALL_POKEMON.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return ALL_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q)
    ).slice(0, 20);
  }, [searchQuery]);

  const currentExp = useMemo(() => getExpForLevel(startLevel), [startLevel]);
  const targetExp = useMemo(() => getExpForLevel(targetLevel), [targetLevel]);
  const expDifference = Math.max(0, targetExp - currentExp);
  const rareCandiesNeeded = Math.max(0, targetLevel - startLevel);

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
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Calculadora de Experiencia & Caramelos</h2>
                <p className="text-xs text-zinc-400">
                  Cálculo de EXP total y caramelos Cobblemon necesarios para alcanzar cualquier nivel
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Pokémon */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-white capitalize">{selectedPokemon.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">Curva de Crecimiento: Media-Rápida</span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar especie..."
                  className="bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-full sm:w-52"
                />
              </div>
            </div>

            {searchQuery.trim() && (
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2 custom-scrollbar">
                {availablePokemon.map((p) => (
                  <button
                    key={p.id + "-" + p.name}
                    onClick={() => {
                      setSelectedPokemon(p);
                      setSearchQuery("");
                    }}
                    className="w-full p-2 rounded-xl flex items-center justify-between text-left hover:bg-white/[0.06] text-zinc-300 text-xs transition"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">#{p.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controles de Nivel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold">Nivel Inicial:</span>
                <span className="font-mono font-bold text-white">{startLevel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="99"
                value={startLevel}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStartLevel(val);
                  if (val >= targetLevel) setTargetLevel(val + 1);
                }}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-semibold">Nivel Meta:</span>
                <span className="font-mono font-bold text-amber-400">{targetLevel}</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                value={targetLevel}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTargetLevel(val);
                  if (val <= startLevel) setStartLevel(val - 1);
                }}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Resultado de Experiencia */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block uppercase font-mono">Experiencia Requerida:</span>
              <span className="text-3xl font-black text-amber-300 font-mono">
                {expDifference.toLocaleString()} EXP
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Equivalente en Caramelos Raros:</span>
              <span className="text-xl font-bold text-white font-mono">{rareCandiesNeeded} caramelos</span>
            </div>
          </div>

          {/* Desglose de Caramelos Exp Cobblemon */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Equivalencias en Caramelos Exp de Minecraft / Cobblemon:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {CANDY_TYPES.map((c) => {
                const count = Math.ceil(expDifference / c.exp);
                return (
                  <div key={c.name} className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">+{c.exp.toLocaleString()} EXP</span>
                    </div>
                    <span className="text-base font-black text-amber-400 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
