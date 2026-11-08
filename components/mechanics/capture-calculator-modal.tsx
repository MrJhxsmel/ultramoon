"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crosshair,
  Search,
  Moon,
  Compass,
  Waves,
  Clock,
  CheckCircle2,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface CaptureCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

export function CaptureCalculatorModal({ isOpen, onClose }: CaptureCalculatorModalProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData>(ALL_POKEMON[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hpPercent, setHpPercent] = useState<number>(20);
  const [statusCondition, setStatusCondition] = useState<"none" | "paralysis" | "sleep">("sleep");

  // Condiciones de Minecraft
  const [isNightOrCave, setIsNightOrCave] = useState(true); // Y < 60 o Noche
  const [isUnderwater, setIsUnderwater] = useState(false);
  const [turnsPassed, setTurnsPassed] = useState(3);

  const availablePokemon = useMemo(() => {
    if (!searchQuery.trim()) return ALL_POKEMON.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return ALL_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q)
    ).slice(0, 20);
  }, [searchQuery]);

  // Lista de Poké Balls con multiplicadores dinámicos de Cobblemon
  const ballModifiers = useMemo(() => {
    const isWaterOrBug = selectedPokemon.types.some((t) => {
      const low = t.toLowerCase();
      return low === "water" || low === "bug";
    });

    const timerMultiplier = Math.min(4.0, 1.0 + turnsPassed * 0.3);

    return [
      { name: "Poké Ball", mult: 1.0, condition: "Multiplicador estándar" },
      { name: "Super Ball", mult: 1.5, condition: "1.5x efectividad" },
      { name: "Ultra Ball", mult: 2.0, condition: "2.0x efectividad" },
      {
        name: "Ocaso Ball (Dusk Ball)",
        mult: isNightOrCave ? 3.0 : 1.0,
        condition: isNightOrCave ? "✓ Activa (Cueva Y < 60 o de noche)" : "Inactiva (1.0x de día)",
        active: isNightOrCave,
      },
      {
        name: "Malla Ball (Net Ball)",
        mult: isWaterOrBug ? 3.5 : 1.0,
        condition: isWaterOrBug ? `✓ Activa contra ${selectedPokemon.name}` : "Inactiva (No es Agua/Bicho)",
        active: isWaterOrBug,
      },
      {
        name: "Buceo Ball (Dive Ball)",
        mult: isUnderwater ? 3.5 : 1.0,
        condition: isUnderwater ? "✓ Activa bajo el agua" : "Inactiva en superficie",
        active: isUnderwater,
      },
      {
        name: "Turno Ball (Timer Ball)",
        mult: Number(timerMultiplier.toFixed(1)),
        condition: `Turno ${turnsPassed} (Escala hasta 4.0x)`,
        active: turnsPassed >= 5,
      },
      { name: "Master Ball", mult: 255.0, condition: "Captura 100% garantizada" },
    ];
  }, [selectedPokemon, isNightOrCave, isUnderwater, turnsPassed]);

  // Fórmula Gen 9 / Cobblemon
  const calculateRate = (ballMult: number) => {
    if (ballMult >= 255) return 100;
    const baseCatch = 45; // Catch rate promedio
    const statusMult = statusCondition === "sleep" ? 2.5 : statusCondition === "paralysis" ? 1.5 : 1.0;
    const hpFactor = ((3 * 100 - 2 * hpPercent) / (3 * 100));
    const finalVal = Math.min(100, Math.floor(((hpFactor * baseCatch * ballMult) / 255) * statusMult * 100));
    return Math.max(1, finalVal);
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
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Calculadora de Captura Contextual</h2>
                <p className="text-xs text-zinc-400">
                  Ratios precisos considerando Ocaso Ball (cuevas Y&lt;60), Malla Ball y turnos de combate
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Objetivo */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="w-12 h-12 object-contain" />
              <div>
                <h4 className="text-sm font-bold text-white capitalize">{selectedPokemon.name}</h4>
                <div className="flex gap-1 mt-0.5">
                  {selectedPokemon.types.map((t) => (
                    <span key={t} className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cambiar Pokémon..."
                className="bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 w-full sm:w-52"
              />
            </div>
          </div>

          {searchQuery.trim() && (
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border border-white/10 p-2 rounded-2xl bg-zinc-900 custom-scrollbar">
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

          {/* Variables de Combate & Entorno Minecraft */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Salud & Estado del Pokémon:
              </span>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Salud restante:</span>
                  <span className="font-mono font-bold text-white">{hpPercent}% HP</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={hpPercent}
                  onChange={(e) => setHpPercent(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex gap-1.5 pt-1">
                {[
                  { id: "none", label: "Sin estado" },
                  { id: "paralysis", label: "Parálisis (1.5x)" },
                  { id: "sleep", label: "Sueño / Congelado (2.5x)" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusCondition(st.id as any)}
                    className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-bold border transition ${
                      statusCondition === st.id
                        ? "bg-indigo-600 text-white border-indigo-400"
                        : "bg-zinc-950 text-zinc-400 border-white/5"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Entorno en Minecraft:
              </span>

              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setIsNightOrCave(!isNightOrCave)}
                  className={`w-full py-1.5 px-3 rounded-xl border flex items-center justify-between transition ${
                    isNightOrCave ? "bg-purple-950/40 border-purple-500/50 text-purple-200" : "bg-zinc-950 border-white/5 text-zinc-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                    Cueva (Y &lt; 60) o Noche en Minecraft
                  </span>
                  <span className="font-mono font-bold text-[11px]">{isNightOrCave ? "3.0x" : "1.0x"}</span>
                </button>

                <button
                  onClick={() => setIsUnderwater(!isUnderwater)}
                  className={`w-full py-1.5 px-3 rounded-xl border flex items-center justify-between transition ${
                    isUnderwater ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200" : "bg-zinc-950 border-white/5 text-zinc-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    Bajo el agua (Buceo)
                  </span>
                  <span className="font-mono font-bold text-[11px]">{isUnderwater ? "3.5x" : "1.0x"}</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Turnos transcurridos:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 5, 10].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTurnsPassed(t)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                          turnsPassed === t ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        T{t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Probabilidades de Captura por Poké Ball */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Probabilidad Estimada por Poké Ball en este Escenario:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ballModifiers.map((ball) => {
                const rate = calculateRate(ball.mult);
                return (
                  <div
                    key={ball.name}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      ball.active
                        ? "bg-indigo-950/20 border-indigo-500/40 shadow-sm"
                        : "bg-zinc-900/60 border-white/5"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{ball.name}</span>
                      <span className="text-[10px] text-zinc-400 block">{ball.condition}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-black font-mono ${
                        rate > 70 ? "text-emerald-400" : rate > 35 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {rate}%
                      </span>
                    </div>
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
