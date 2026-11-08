"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Compass,
  Zap,
  Target,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  Calculator,
} from "lucide-react";

interface EvTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EvRoute {
  stat: string;
  pokemon: string;
  baseEvYield: number;
  biome: string;
  time: string;
  height: string;
  recommendedBall: string;
}

const EV_ROUTES: EvRoute[] = [
  { stat: "HP", pokemon: "Bidoof / Wooper", baseEvYield: 1, biome: "Ríos y Pantanos", time: "Cualquiera", height: "Y: 60 - 75", recommendedBall: "Net Ball" },
  { stat: "Ataque", pokemon: "Shinx / Mankey", baseEvYield: 1, biome: "Planicies y Montañas", time: "Día", height: "Y: > 64", recommendedBall: "Ultra Ball" },
  { stat: "Defensa", pokemon: "Geodude / Rolycoly", baseEvYield: 1, biome: "Cuevas y Cavernas", time: "Cualquiera", height: "Y: < 50", recommendedBall: "Dusk Ball" },
  { stat: "Atq. Especial", pokemon: "Gastly / Psyduck", baseEvYield: 1, biome: "Cuevas oscuras y Lagos", time: "Noche", height: "Y: < 40", recommendedBall: "Dusk Ball" },
  { stat: "Def. Especial", pokemon: "Tentacool / Drowzee", baseEvYield: 1, biome: "Océanos y Playas", time: "Cualquiera", height: "Y: 50 - 64", recommendedBall: "Dive Ball" },
  { stat: "Velocidad", pokemon: "Magikarp / Zubat", baseEvYield: 1, biome: "Ríos rápidos y Cuevas", time: "Cualquiera", height: "Y: 30 - 65", recommendedBall: "Net Ball" },
];

export function EvTrackerModal({ isOpen, onClose }: EvTrackerModalProps) {
  const [selectedStat, setSelectedStat] = useState<string>("Velocidad");
  const [targetEvs, setTargetEvs] = useState<number>(252);
  const [hasPowerItem, setHasPowerItem] = useState<boolean>(true);
  const [hasPokerus, setHasPokerus] = useState<boolean>(false);

  const activeRoute = useMemo(() => {
    return EV_ROUTES.find((r) => r.stat === selectedStat) || EV_ROUTES[5];
  }, [selectedStat]);

  // Cálculo matemático oficial de EVs en Gen 9 / Cobblemon:
  // Base EV + 8 (si tiene objeto recio) * 2 (si tiene Pokérus)
  const calculation = useMemo(() => {
    const base = activeRoute.baseEvYield;
    const itemBonus = hasPowerItem ? 8 : 0;
    const multiplier = hasPokerus ? 2 : 1;
    const evPerKill = (base + itemBonus) * multiplier;
    const killsNeeded = Math.ceil(targetEvs / evPerKill);

    return {
      evPerKill,
      killsNeeded,
    };
  }, [activeRoute, targetEvs, hasPowerItem, hasPokerus]);

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
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Guía de Farmeo & Calculadora de EVs</h2>
                <p className="text-xs text-zinc-400">
                  Rutas de spawn en Minecraft y cálculo exacto de Kills necesarias
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CALCULADORA DE KILLS INTERACTIVA */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                Simulador de Kills Rápidas
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                Fórmula Gen 9: (Base + 8) × 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Estadística Objetivo:</span>
                <select
                  value={selectedStat}
                  onChange={(e) => setSelectedStat(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {EV_ROUTES.map((r) => (
                    <option key={r.stat} value={r.stat}>{r.stat}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">EVs a conseguir:</span>
                <input
                  type="number"
                  value={targetEvs}
                  onChange={(e) => setTargetEvs(Number(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Objeto Recio (+8):</span>
                <button
                  onClick={() => setHasPowerItem(!hasPowerItem)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition border ${
                    hasPowerItem
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-zinc-950 text-zinc-500 border-white/5"
                  }`}
                >
                  {hasPowerItem ? "Equipado (+8 EVs)" : "Sin Objeto (+0)"}
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Infección Pokérus (×2):</span>
                <button
                  onClick={() => setHasPokerus(!hasPokerus)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition border ${
                    hasPokerus
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-zinc-950 text-zinc-500 border-white/5"
                  }`}
                >
                  {hasPokerus ? "Activo (Doble EV)" : "Inactivo (x1)"}
                </button>
              </div>
            </div>

            {/* Resultado de Kills */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-zinc-400">Ruta recomendada:</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Derrotar a {activeRoute.pokemon} ({activeRoute.biome})
                </h4>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">EVs por Kill</span>
                  <span className="text-sm font-bold text-purple-300 font-mono">+{calculation.evPerKill}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-center">
                  <span className="text-[10px] text-purple-300 uppercase font-bold block">Kills Exactas</span>
                  <span className="text-xl font-black text-white font-mono">{calculation.killsNeeded}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Rutas en Minecraft */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Todas las Rutas Óptimas de Cobblemon:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EV_ROUTES.map((route) => (
                <div
                  key={route.stat}
                  onClick={() => setSelectedStat(route.stat)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedStat === route.stat
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-zinc-900/60 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{route.stat}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/10">
                      +{route.baseEvYield} EV Base
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 font-semibold">{route.pokemon}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-2 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400" /> {route.biome}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {route.time}</span>
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
