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
  const [activeTab, setActiveTab] = useState<"all" | "blocks" | "friendship">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = SPECIAL_EVOLUTIONS;
    if (activeTab !== "all") {
      list = list.filter((e) => e.category === activeTab);
    }
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
                <h2 className="text-xl font-bold text-white">Evoluciones Especiales en Cobblemon</h2>
                <p className="text-xs text-zinc-400">
                  Bloques de Minecraft, contador de amistad (220) y condiciones horarias
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contador de Amistad de Minecraft */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/20 via-zinc-900 to-zinc-950 border border-rose-500/20 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Regla Oficial de Amistad (220 Puntos):
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Para subir los 220 puntos de amistad rápidamente: dale de comer <strong>22 Bayas reductoras de EVs</strong> (Grana, Algama, etc.), equípale una <strong>Campana Alivio (Soothe Bell)</strong> o camina 2,000 bloques teniéndolo fuera de la Poké Ball.
            </p>
          </div>

          {/* Navegación y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "all" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveTab("blocks")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "blocks" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Por Bloques de Minecraft
              </button>
              <button
                onClick={() => setActiveTab("friendship")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === "friendship" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Por Amistad (220)
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar Pokémon..."
                className="w-full sm:w-48 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Lista de Métodos */}
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
