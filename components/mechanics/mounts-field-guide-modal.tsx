"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Compass,
  Search,
  Flame,
  Zap,
  Wind,
  Waves,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";

interface MountsFieldGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MountEntry {
  category: "flying" | "swimming" | "ground" | "field-ability";
  name: string;
  speedRating: "Rápido" | "Muy Rápido" | "Estándar";
  role: string;
  description: string;
  pokemon: string[];
}

const FIELD_ENTRIES: MountEntry[] = [
  {
    category: "flying",
    name: "Montura Aérea (Vuelo Libre)",
    speedRating: "Muy Rápido",
    role: "Exploración y Viaje Rápido",
    description: "Permite volar sin restricciones en el mundo de Minecraft. Presiona Espacio para ascender.",
    pokemon: ["Charizard", "Pidgeot", "Dragonite", "Braviary", "Corviknight", "Salamence", "Noivern"],
  },
  {
    category: "swimming",
    name: "Montura Acuática (Nado Rápido)",
    speedRating: "Rápido",
    role: "Exploración Oceánica",
    description: "Navega a gran velocidad sobre agua y bucea sin penalización de oxígeno.",
    pokemon: ["Lapras", "Gyarados", "Blastoise", "Basculegion", "Sharpedo", "Milotic"],
  },
  {
    category: "ground",
    name: "Montura Terrestre (Escalada y Salto)",
    speedRating: "Muy Rápido",
    role: "Recorrido por Terreno",
    description: "Supera desniveles de 1 a 2 bloques automáticamente y reduce el daño por caída.",
    pokemon: ["Arcanine", "Wyrdeer", "Rapidash", "Mudsdale", "Garchomp", "Tauros"],
  },
  {
    category: "field-ability",
    name: "Cuerpo Llama / Escudo Magma",
    speedRating: "Estándar",
    role: "Incubadora de Pasture",
    description: "Tener un Pokémon con esta habilidad en el equipo reduce a la mitad los pasos necesarios para eclosionar huevos en Cobblemon.",
    pokemon: ["Magmar", "Magmortar", "Talonflame", "Camerupt", "Coalossal", "Centiskorch"],
  },
  {
    category: "field-ability",
    name: "Recogida (Pickup)",
    speedRating: "Estándar",
    role: "Farming de Ítems Raros",
    description: "Probabilidad de encontrar Caramelos Raros, Piedras Evolutivas e Hilos tras ganar combates salvajes.",
    pokemon: ["Meowth", "Zigzagoon", "Linoone", "Pachirisu", "Munchlax", "Dedenne"],
  },
  {
    category: "field-ability",
    name: "Sincronía (Synchronize)",
    speedRating: "Estándar",
    role: "Caza de Naturalezas",
    description: "Tenerlo en el primer puesto del equipo otorga un 50% de probabilidad de que el Pokémon salvaje spawnee con su misma naturaleza.",
    pokemon: ["Ralts", "Kirlia", "Gardevoir", "Alakazam", "Espeon", "Umbreon"],
  },
];

export function MountsFieldGuideModal({ isOpen, onClose }: MountsFieldGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "flying" | "swimming" | "ground" | "field-ability">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = FIELD_ENTRIES;
    if (activeTab !== "all") {
      list = list.filter((e) => e.category === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.pokemon.some((p) => p.toLowerCase().includes(q))
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
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Monturas & Habilidades de Campo</h2>
                <p className="text-xs text-zinc-400">
                  Guía de transporte, utilidades de supervivencia e incubación de huevos en Minecraft
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {[
                { id: "all", label: "Todas" },
                { id: "flying", label: "Vuelo" },
                { id: "swimming", label: "Nado" },
                { id: "ground", label: "Terrestre" },
                { id: "field-ability", label: "Habilidades" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar montura o Pokémon..."
                className="w-full sm:w-60 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {entry.category === "flying" && <Wind className="w-4 h-4 text-cyan-400" />}
                      {entry.category === "swimming" && <Waves className="w-4 h-4 text-blue-400" />}
                      {entry.category === "ground" && <Compass className="w-4 h-4 text-amber-400" />}
                      {entry.category === "field-ability" && <Flame className="w-4 h-4 text-rose-400" />}
                      <span>{entry.name}</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                      {entry.speedRating}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {entry.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Especies destacadas en Cobblemon:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.pokemon.map((poke) => (
                      <span
                        key={poke}
                        className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-white/10 text-[11px] text-emerald-300 font-semibold"
                      >
                        {poke}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
