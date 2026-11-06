"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crosshair,
  Search,
  Sparkles,
  Shield,
  Activity,
  Layers,
  Moon,
  Clock,
  Compass,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface CaptureCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const STATUS_CONDITIONS = [
  { id: "none", name: "Sin Estado", mult: 1.0, color: "text-zinc-400" },
  { id: "sleep", name: "Dormido (Sleep)", mult: 2.5, color: "text-blue-400" },
  { id: "freeze", name: "Congelado (Freeze)", mult: 2.5, color: "text-cyan-300" },
  { id: "paralyze", name: "Paralizado (Paralyze)", mult: 1.5, color: "text-amber-400" },
  { id: "poison", name: "Envenenado (Poison)", mult: 1.5, color: "text-purple-400" },
  { id: "burn", name: "Quemado (Burn)", mult: 1.5, color: "text-orange-400" },
];

const POKEBALLS = [
  { id: "poke-ball", name: "Poké Ball", mult: 1.0 },
  { id: "great-ball", name: "Súper Ball", mult: 1.5 },
  { id: "ultra-ball", name: "Ultra Ball", mult: 2.0 },
  { id: "dusk-ball", name: "Ocaso Ball (Noche o cueva)", mult: 3.0 },
  { id: "quick-ball", name: "Veloz Ball (Turno 1)", mult: 5.0 },
  { id: "dive-ball", name: "Buceo Ball (Agua)", mult: 3.5 },
  { id: "net-ball", name: "Malla Ball (Agua/Bicho)", mult: 3.5 },
  { id: "master-ball", name: "Master Ball", mult: 255.0 },
];

export function CaptureCalculatorModal({ isOpen, onClose }: CaptureCalculatorModalProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData>(ALL_POKEMON[0]);
  const [currentHpPercent, setCurrentHpPercent] = useState<number>(100);
  const [selectedStatus, setSelectedStatus] = useState<string>("none");
  const [selectedBall, setSelectedBall] = useState<string>("ultra-ball");
  const [searchQuery, setSearchQuery] = useState("");

  const [inCaveOrNight, setInCaveOrNight] = useState(false);
  const [inWater, setInWater] = useState(false);
  const [isTurnOne, setIsTurnOne] = useState(false);

  const availablePokemon = useMemo(() => {
    if (!searchQuery.trim()) return ALL_POKEMON.slice(0, 25);
    const q = searchQuery.toLowerCase();
    return ALL_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [searchQuery]);

  // Cálculo matemático oficial de captura en Cobblemon / Gen 9
  const captureProbability = useMemo(() => {
    const catchRate = selectedPokemon.catchRate || 45;
    const maxHp = 100;
    const currentHp = Math.max(1, (currentHpPercent / 100) * maxHp);

    let ballMult = POKEBALLS.find((b) => b.id === selectedBall)?.mult || 1.0;

    if (selectedBall === "dusk-ball" && !inCaveOrNight) ballMult = 1.0;
    if (selectedBall === "dive-ball" && !inWater) ballMult = 1.0;
    if (selectedBall === "quick-ball" && !isTurnOne) ballMult = 1.0;

    if (
      selectedBall === "net-ball" &&
      !selectedPokemon.types.some((t) => ["water", "bug"].includes(t.toLowerCase()))
    ) {
      ballMult = 1.0;
    }

    const statusMult = STATUS_CONDITIONS.find((s) => s.id === selectedStatus)?.mult || 1.0;

    if (selectedBall === "master-ball") return 100;

    const a = Math.floor(
      (((3 * maxHp - 2 * currentHp) * 4096 * catchRate * ballMult) / (3 * maxHp)) * statusMult
    );

    if (a >= 1048560) return 100;

    const b = Math.floor(65536 / Math.pow(1048560 / a, 0.25));
    const shakeProb = b / 65536;
    const finalProb = Math.min(100, Math.pow(shakeProb, 4) * 100);

    return Number(finalProb.toFixed(1));
  }, [
    selectedPokemon,
    currentHpPercent,
    selectedStatus,
    selectedBall,
    inCaveOrNight,
    inWater,
    isTurnOne,
  ]);

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
                <h2 className="text-xl font-bold text-white">Calculadora de Captura Cobblemon</h2>
                <p className="text-xs text-zinc-400">
                  Fórmula matemática oficial según PS restantes, clima, cueva y Poké Balls
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Pokémon con Buscador Rápido */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedPokemon.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Catch Rate Base: {selectedPokemon.catchRate || 45}
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar especie salvaje..."
                  className="bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 w-full sm:w-56"
                />
              </div>
            </div>

            {searchQuery.trim() && (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2 custom-scrollbar">
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

          {/* Ajuste de Salud y Condiciones Ambientales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Salud Restante:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{currentHpPercent}% PS</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={currentHpPercent}
                onChange={(e) => setCurrentHpPercent(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>1 PS (Falso Tortazo)</span>
                <span>50%</span>
                <span>100% (Lleno)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <span className="text-xs font-bold text-white block">Estado Alterado:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {STATUS_CONDITIONS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition truncate ${
                      selectedStatus === st.id
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                        : "bg-zinc-950 text-zinc-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {st.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selección de Poké Ball & Condiciones Especiales */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-white">Poké Ball Utilizada:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setInCaveOrNight(!inCaveOrNight)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                    inCaveOrNight
                      ? "bg-purple-600/30 text-purple-300 border-purple-500/50"
                      : "bg-zinc-950 text-zinc-500 border-white/5"
                  }`}
                >
                  🌙 Noche o Cueva (Y &lt; 60)
                </button>
                <button
                  onClick={() => setIsTurnOne(!isTurnOne)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                    isTurnOne
                      ? "bg-cyan-600/30 text-cyan-300 border-cyan-500/50"
                      : "bg-zinc-950 text-zinc-500 border-white/5"
                  }`}
                >
                  ⚡ Turno 1
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POKEBALLS.map((ball) => (
                <button
                  key={ball.id}
                  onClick={() => setSelectedBall(ball.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedBall === ball.id
                      ? "bg-indigo-600/20 border-indigo-500/50 text-white"
                      : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{ball.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500">Mult: {ball.mult}x</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado Final de Probabilidad */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block">Probabilidad de Captura por Lanzamiento:</span>
              <span className="text-3xl font-black text-indigo-300 font-mono">
                {captureProbability}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Efectividad estimada:</span>
              <span className="text-sm font-bold text-emerald-400">
                {captureProbability >= 80 ? "¡Captura casi asegurada!" : captureProbability >= 40 ? "Buena probabilidad" : "Riesgo alto de escape"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
