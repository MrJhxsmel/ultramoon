"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Gauge,
  Swords,
  Zap,
  Wind,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface PokemonComparatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

export function PokemonComparator({ isOpen, onClose }: PokemonComparatorProps) {
  const [poke1, setPoke1] = useState<PokemonData>(ALL_POKEMON[5] || ALL_POKEMON[0]); // Charizard
  const [poke2, setPoke2] = useState<PokemonData>(ALL_POKEMON[2] || ALL_POKEMON[1]); // Venusaur

  // Modificadores de combate para Pokémon 1
  const [scarf1, setScarf1] = useState(false);
  const [tailwind1, setTailwind1] = useState(false);
  const [paralyzed1, setParalyzed1] = useState(false);
  const [natureSpe1, setNatureSpe1] = useState<"neutral" | "positive" | "negative">("positive");
  const [evsSpe1, setEvsSpe1] = useState<number>(252);

  // Modificadores de combate para Pokémon 2
  const [scarf2, setScarf2] = useState(false);
  const [tailwind2, setTailwind2] = useState(false);
  const [paralyzed2, setParalyzed2] = useState(false);
  const [natureSpe2, setNatureSpe2] = useState<"neutral" | "positive" | "negative">("positive");
  const [evsSpe2, setEvsSpe2] = useState<number>(252);

  // Cálculo de velocidad real a Nivel 50 oficial VGC
  const calculateSpeed = (
    baseSpeed: number,
    evs: number,
    nature: "neutral" | "positive" | "negative",
    scarf: boolean,
    tailwind: boolean,
    paralyzed: boolean
  ) => {
    const iv = 31;
    const rawStat = Math.floor(((2 * baseSpeed + iv + Math.floor(evs / 4)) * 50) / 100) + 5;
    const natMult = nature === "positive" ? 1.1 : nature === "negative" ? 0.9 : 1.0;
    let finalSpe = Math.floor(rawStat * natMult);

    if (scarf) finalSpe = Math.floor(finalSpe * 1.5);
    if (tailwind) finalSpe = finalSpe * 2;
    if (paralyzed) finalSpe = Math.floor(finalSpe * 0.5);

    return finalSpe;
  };

  const speed1 = useMemo(
    () => calculateSpeed(poke1.stats.speed, evsSpe1, natureSpe1, scarf1, tailwind1, paralyzed1),
    [poke1, evsSpe1, natureSpe1, scarf1, tailwind1, paralyzed1]
  );

  const speed2 = useMemo(
    () => calculateSpeed(poke2.stats.speed, evsSpe2, natureSpe2, scarf2, tailwind2, paralyzed2),
    [poke2, evsSpe2, natureSpe2, scarf2, tailwind2, paralyzed2]
  );

  const speedDifference = Math.abs(speed1 - speed2);
  const winner = speed1 > speed2 ? poke1.name : speed2 > speed1 ? poke2.name : "Empate de Velocidad (Speed Tie 50/50)";

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
                <Gauge className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Comparador 1 vs 1 & Speed Tiers</h2>
                <p className="text-xs text-zinc-400">
                  Calculador en vivo de iniciativa a Nv. 50 con Choice Scarf, Tailwind y Parálisis
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

          {/* Duelo de Speed Tiers */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-cyan-950/20 to-zinc-900 border border-cyan-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-zinc-400 block uppercase">Iniciativa en Turno 1</span>
                <h3 className="text-xl font-black text-cyan-300 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  {speed1 === speed2 ? winner : `${winner} ataca primero`}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-mono">Diferencia exacta:</span>
                <span className="text-sm font-bold text-white font-mono">+{speedDifference} puntos de Velocidad</span>
              </div>
            </div>

            {/* Barra Comparativa */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-purple-400">{poke1.name}: {speed1} Vel</span>
                <span className="text-amber-400">{poke2.name}: {speed2} Vel</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${(speed1 / (speed1 + speed2)) * 100}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(speed2 / (speed1 + speed2)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Columnas de Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pokémon 1 */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-purple-400">Combatiente #1</span>
                <select
                  value={poke1.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setPoke1(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 100).map((p) => (
                    <option key={p.id + p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={poke1.sprite} alt={poke1.name} className="w-14 h-14 object-contain" />
                <div>
                  <h4 className="text-base font-bold text-white">{poke1.name}</h4>
                  <span className="text-xs text-zinc-400 font-mono">Velocidad Base: {poke1.stats.speed}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">EVs en Velocidad:</span>
                  <div className="flex gap-1">
                    {[0, 252].map((ev) => (
                      <button
                        key={ev}
                        onClick={() => setEvsSpe1(ev)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                          evsSpe1 === ev ? "bg-purple-600 text-white" : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Naturaleza:</span>
                  <button
                    onClick={() => setNatureSpe1(natureSpe1 === "positive" ? "neutral" : "positive")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      natureSpe1 === "positive" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {natureSpe1 === "positive" ? "+10% (Favorable)" : "Neutra"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setScarf1(!scarf1)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      scarf1 ? "bg-purple-600 text-white border-purple-400" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Choice Scarf (1.5x)
                  </button>
                  <button
                    onClick={() => setTailwind1(!tailwind1)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      tailwind1 ? "bg-cyan-600 text-white border-cyan-400" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Tailwind (2x)
                  </button>
                  <button
                    onClick={() => setParalyzed1(!paralyzed1)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      paralyzed1 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Parálisis (0.5x)
                  </button>
                </div>
              </div>
            </div>

            {/* Pokémon 2 */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-amber-400">Combatiente #2</span>
                <select
                  value={poke2.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setPoke2(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 100).map((p) => (
                    <option key={p.id + p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={poke2.sprite} alt={poke2.name} className="w-14 h-14 object-contain" />
                <div>
                  <h4 className="text-base font-bold text-white">{poke2.name}</h4>
                  <span className="text-xs text-zinc-400 font-mono">Velocidad Base: {poke2.stats.speed}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">EVs en Velocidad:</span>
                  <div className="flex gap-1">
                    {[0, 252].map((ev) => (
                      <button
                        key={ev}
                        onClick={() => setEvsSpe2(ev)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                          evsSpe2 === ev ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Naturaleza:</span>
                  <button
                    onClick={() => setNatureSpe2(natureSpe2 === "positive" ? "neutral" : "positive")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      natureSpe2 === "positive" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {natureSpe2 === "positive" ? "+10% (Favorable)" : "Neutra"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setScarf2(!scarf2)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      scarf2 ? "bg-amber-500 text-black border-amber-400" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Choice Scarf (1.5x)
                  </button>
                  <button
                    onClick={() => setTailwind2(!tailwind2)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      tailwind2 ? "bg-cyan-600 text-white border-cyan-400" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Tailwind (2x)
                  </button>
                  <button
                    onClick={() => setParalyzed2(!paralyzed2)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      paralyzed2 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    Parálisis (0.5x)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
