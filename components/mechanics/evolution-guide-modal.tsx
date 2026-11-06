"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Heart,
  Search,
  Box,
  Layers,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Calculator,
  Bell,
} from "lucide-react";

interface EvolutionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpecialEvo {
  pokemon: string;
  evolution: string;
  method: string;
  blockRequired?: string;
  timeCondition?: string;
  category: "blocks" | "friendship" | "items";
  tips: string;
}

const SPECIAL_EVOLUTIONS: SpecialEvo[] = [
  {
    pokemon: "Magneton",
    evolution: "Magnezone",
    method: "Subir nivel cerca de Bloque de Redstone o Cueva Magnética",
    blockRequired: "Bloque de Redstone",
    category: "blocks",
    tips: "Coloca un bloque de Redstone en el suelo y dale 1 Caramelo Raro.",
  },
  {
    pokemon: "Eevee",
    evolution: "Glaceon",
    method: "Subir nivel cerca de Hielo Compacto / Hielo Azul",
    blockRequired: "Hielo Compacto (Packed Ice)",
    category: "blocks",
    tips: "Evoluciona en biomas helados o colocando hielo azul en la base.",
  },
  {
    pokemon: "Eevee",
    evolution: "Leafeon",
    method: "Subir nivel cerca de Bloque de Musgo",
    blockRequired: "Bloque de Musgo (Moss Block)",
    category: "blocks",
    tips: "Coloca un bloque de musgo en el suelo al subir de nivel.",
  },
  {
    pokemon: "Riolu",
    evolution: "Lucario",
    method: "Amistad ≥ 220 durante el Día",
    timeCondition: "Día",
    category: "friendship",
    tips: "Requiere 220 de amistad. Usa Bayas reductoras de EVs o Campana Alivio.",
  },
  {
    pokemon: "Eevee",
    evolution: "Umbreon",
    method: "Amistad ≥ 220 durante la Noche",
    timeCondition: "Noche",
    category: "friendship",
    tips: "No debe conocer movimientos tipo Hada (para evitar Sylveon).",
  },
  {
    pokemon: "Eevee",
    evolution: "Espeon",
    method: "Amistad ≥ 220 durante el Día",
    timeCondition: "Día",
    category: "friendship",
    tips: "Sube de nivel durante el día con alta amistad.",
  },
  {
    pokemon: "Snom",
    evolution: "Frosmoth",
    method: "Amistad ≥ 220 durante la Noche",
    timeCondition: "Noche",
    category: "friendship",
    tips: "Solo evoluciona de noche en Minecraft con la barra de afecto llena.",
  },
  {
    pokemon: "Golbat",
    evolution: "Crobat",
    method: "Amistad ≥ 220",
    category: "friendship",
    tips: "Camina con él fuera de la Poké Ball o aliméntalo con bayas dulces.",
  },
];

export function EvolutionGuideModal({ isOpen, onClose }: EvolutionGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"calculator" | "blocks" | "friendship">("calculator");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculadora de Amistad
  const [currentFriendship, setCurrentFriendship] = useState<number>(70); // Valor base al capturar
  const [hasSootheBell, setHasSootheBell] = useState<boolean>(true);

  const neededPoints = Math.max(0, 220 - currentFriendship);
  const berryGain = hasSootheBell ? 15 : 10;
  const berriesRequired = Math.ceil(neededPoints / berryGain);
  const blocksToWalk = Math.ceil(neededPoints * (hasSootheBell ? 8 : 16));

  const filtered = useMemo(() => {
    let list = SPECIAL_EVOLUTIONS;
    if (activeTab === "blocks") list = list.filter((e) => e.category === "blocks");
    if (activeTab === "friendship") list = list.filter((e) => e.category === "friendship");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.pokemon.toLowerCase().includes(q) ||
          e.evolution.toLowerCase().includes(q) ||
          e.method.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery]);

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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Evoluciones Especiales & Calculador de Amistad</h2>
                <p className="text-xs text-zinc-400">
                  Calculador exacto de bayas para llegar a 220 de afecto y bloques de Minecraft
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "calculator" ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculador de Amistad (220)</span>
              </button>

              <button
                onClick={() => setActiveTab("blocks")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "blocks" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Por Bloques
              </button>

              <button
                onClick={() => setActiveTab("friendship")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "friendship" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Lista por Afecto
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar especie..."
                className="w-full sm:w-44 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* CALCULADORA INTERACTIVA DE AMISTAD */}
          {activeTab === "calculator" && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-rose-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Simulador de Subida de Amistad (Riolu, Eevee, Golbat, Snom)
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  Meta: 220 Puntos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-400">Amistad actual del Pokémon:</span>
                    <span className="font-mono font-bold text-white">{currentFriendship} / 220</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="220"
                    value={currentFriendship}
                    onChange={(e) => setCurrentFriendship(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>0 (Recién nacido)</span>
                    <span>70 (Salvaje)</span>
                    <span>220 (Evolución)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-zinc-400 block">Objeto Equipado:</span>
                  <button
                    onClick={() => setHasSootheBell(!hasSootheBell)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-2 ${
                      hasSootheBell
                        ? "bg-purple-600/20 text-purple-300 border-purple-500/40"
                        : "bg-zinc-950 text-zinc-500 border-white/5"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{hasSootheBell ? "Campana Alivio (Soothe Bell) Activa (+50%)" : "Sin Campana (+0%)"}</span>
                  </button>
                </div>
              </div>

              {/* Resultados directos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Bayas Necesarias:</span>
                    <span className="text-xs text-zinc-300">Bayas Grana, Algama, etc.</span>
                  </div>
                  <span className="text-2xl font-black text-rose-400 font-mono">{berriesRequired}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Bloques a Caminar:</span>
                    <span className="text-xs text-zinc-300">Fuera de la Poké Ball</span>
                  </div>
                  <span className="text-2xl font-black text-cyan-300 font-mono">~{blocksToWalk}m</span>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DE EVOLUCIONES */}
          {activeTab !== "calculator" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <span>{item.pokemon}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-300">{item.evolution}</span>
                      </div>

                      {item.blockRequired && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Bloque
                        </span>
                      )}

                      {item.timeCondition && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {item.timeCondition}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 font-semibold mt-1">{item.method}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                    <span className="text-zinc-500">Tip Cobblemon:</span> {item.tips}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
