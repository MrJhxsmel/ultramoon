"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Apple,
  Search,
  Layers,
  Sparkles,
  Info,
  Grid3X3,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface ApricornGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BallRecipe {
  id: string;
  name: string;
  englishName: string;
  baseMaterial: "Cobre" | "Hierro" | "Oro";
  apricornTop: [string, string, string]; // Las 3 apricorns de la fila superior
  catchRate: string;
  description: string;
  accentColor: string;
}

interface BerryEntry {
  name: string;
  effect: string;
  evReduced?: string;
  flavor: string;
  category: "ev_reduction" | "breeding" | "combat";
}

const BALL_RECIPES: BallRecipe[] = [
  {
    id: "poke-ball",
    name: "Poké Ball",
    englishName: "Poke Ball",
    baseMaterial: "Cobre",
    apricornTop: ["Roja", "Roja", "Roja"],
    catchRate: "1.0x (Estándar)",
    description: "Tapa roja sobre base de cobre y botón de piedra o madera.",
    accentColor: "border-red-500/40 text-red-400 bg-red-500/10",
  },
  {
    id: "great-ball",
    name: "Súper Ball",
    englishName: "Great Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Azul", "Roja", "Azul"],
    catchRate: "1.5x",
    description: "Tapa bicolor sobre base de hierro y botón.",
    accentColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  },
  {
    id: "ultra-ball",
    name: "Ultra Ball",
    englishName: "Ultra Ball",
    baseMaterial: "Oro",
    apricornTop: ["Negra", "Amarilla", "Negra"],
    catchRate: "2.0x",
    description: "Tapa negra y amarilla sobre base de oro y botón.",
    accentColor: "border-amber-400/40 text-amber-300 bg-amber-400/10",
  },
  {
    id: "dusk-ball",
    name: "Ocaso Ball",
    englishName: "Dusk Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Verde", "Negra", "Verde"],
    catchRate: "3.0x de noche o cuevas",
    description: "Especial para oscuridad o bajo Y=60. Base de hierro.",
    accentColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "quick-ball",
    name: "Veloz Ball",
    englishName: "Quick Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Azul", "Amarilla", "Azul"],
    catchRate: "5.0x en turno 1",
    description: "Máxima efectividad al primer contacto en batalla. Base de hierro.",
    accentColor: "border-cyan-400/40 text-cyan-300 bg-cyan-400/10",
  },
  {
    id: "timer-ball",
    name: "Turno Ball",
    englishName: "Timer Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Blanca", "Roja", "Blanca"],
    catchRate: "Hasta 4.0x con el tiempo",
    description: "Aumenta +0.3x cada turno de batalla. Base de hierro.",
    accentColor: "border-zinc-400/40 text-zinc-300 bg-zinc-500/10",
  },
  {
    id: "dive-ball",
    name: "Buceo Ball",
    englishName: "Dive Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Azul", "Azul", "Azul"],
    catchRate: "3.5x en agua",
    description: "Bonificación en océanos o al pescar. Base de hierro.",
    accentColor: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    id: "net-ball",
    name: "Malla Ball",
    englishName: "Net Ball",
    baseMaterial: "Hierro",
    apricornTop: ["Negra", "Azul", "Negra"],
    catchRate: "3.5x Agua / Bicho",
    description: "Efectividad aumentada en tipos Agua y Bicho. Base de hierro.",
    accentColor: "border-teal-500/40 text-teal-400 bg-teal-500/10",
  },
  {
    id: "cobble-ball",
    name: "Cobble Ball",
    englishName: "Cobble Ball",
    baseMaterial: "Cobre",
    apricornTop: ["Negra", "Negra", "Negra"],
    catchRate: "1.25x en cuevas",
    description: "Esfera nativa de Cobblemon elaborada con base de cobre.",
    accentColor: "border-orange-500/40 text-orange-400 bg-orange-500/10",
  },
];

const BERRIES_DATA: BerryEntry[] = [
  { name: "Baya Grana (Pomeg)", effect: "Aumenta felicidad y reduce 10 EVs en HP.", evReduced: "HP (-10)", flavor: "Dulce / Ácida", category: "ev_reduction" },
  { name: "Baya Algama (Kelpsy)", effect: "Aumenta felicidad y reduce 10 EVs en Ataque.", evReduced: "Ataque (-10)", flavor: "Seca / Amarga", category: "ev_reduction" },
  { name: "Baya Ispero (Qualot)", effect: "Aumenta felicidad y reduce 10 EVs en Defensa.", evReduced: "Defensa (-10)", flavor: "Dulce / Picante", category: "ev_reduction" },
  { name: "Baya Meluce (Hondew)", effect: "Aumenta felicidad y reduce 10 EVs en Atq. Especial.", evReduced: "Atq. Esp (-10)", flavor: "Ácida / Amarga", category: "ev_reduction" },
  { name: "Baya Uva (Grepa)", effect: "Aumenta felicidad y reduce 10 EVs en Def. Especial.", evReduced: "Def. Esp (-10)", flavor: "Dulce / Seca", category: "ev_reduction" },
  { name: "Baya Tamate (Tamato)", effect: "Aumenta felicidad y reduce 10 EVs en Velocidad.", evReduced: "Velocidad (-10)", flavor: "Picante / Seca", category: "ev_reduction" },
  { name: "Baya Zidra (Sitrus)", effect: "Restaura el 25% de los PS cuando caen bajo el 50%.", flavor: "Equilibrada", category: "combat" },
  { name: "Baya Ziuela (Lum)", effect: "Cura cualquier problema de estado alterado.", flavor: "Equilibrada", category: "combat" },
  { name: "Hierba Copia (Mirror Herb)", effect: "Permite transferir movimientos huevo entre Pokémon en el Pasture.", flavor: "Especial", category: "breeding" },
];

export function ApricornGuideModal({ isOpen, onClose }: ApricornGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"crafting" | "berries">("crafting");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBalls = useMemo(() => {
    if (!searchQuery.trim()) return BALL_RECIPES;
    const q = searchQuery.toLowerCase();
    return BALL_RECIPES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.englishName.toLowerCase().includes(q) ||
        b.baseMaterial.toLowerCase().includes(q) ||
        b.apricornTop.some((a) => a.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredBerries = useMemo(() => {
    if (!searchQuery.trim()) return BERRIES_DATA;
    const q = searchQuery.toLowerCase();
    return BERRIES_DATA.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.effect.toLowerCase().includes(q) ||
        (b.evReduced && b.evReduced.toLowerCase().includes(q))
    );
  }, [searchQuery]);

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
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Apple className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Guía de Crafteo Cobblemon & Bayas
                </h2>
                <p className="text-xs text-zinc-400">
                  Mesa de crafteo 3x3 de Minecraft oficial y gestión de EVs
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

          {/* Selector de Pestañas y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("crafting")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "crafting"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Mesas de Crafteo 3x3</span>
              </button>

              <button
                onClick={() => setActiveTab("berries")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "berries"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>Bayas & Reducción de EVs</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar Poké Ball o Baya..."
                className="w-full sm:w-64 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* ESQUEMA EXPLICATIVO DE LA MESA 3X3 DE COBBLEMON */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Info className="w-4 h-4 text-purple-400" />
              <span>Proceso Oficial en Cobblemon (Mesa de Trabajo Estándar):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Paso 1: Tapa */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 flex items-center gap-3">
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1.5 rounded-lg border border-white/10 shrink-0">
                  <div className="w-5 h-5 rounded bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-[8px] font-bold text-purple-200">A</div>
                  <div className="w-5 h-5 rounded bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-[8px] font-bold text-purple-200">A</div>
                  <div className="w-5 h-5 rounded bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-[8px] font-bold text-purple-200">A</div>
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                </div>
                <div>
                  <span className="font-bold text-purple-300 block">Paso 1: Tapa de Ball</span>
                  <span className="text-[11px] text-zinc-400">
                    3 Apricorns crudas en la fila superior de la mesa generan la Tapa correspondiente.
                  </span>
                </div>
              </div>

              {/* Paso 2: Ensamblaje */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 flex items-center gap-3">
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1.5 rounded-lg border border-white/10 shrink-0">
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-[7px] font-bold text-rose-200">Tapa</div>
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-[7px] font-bold text-amber-200">Metal</div>
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                  <div className="w-5 h-5 rounded bg-zinc-500/30 border border-zinc-400/40 flex items-center justify-center text-[7px] font-bold text-zinc-200">Botón</div>
                  <div className="w-5 h-5 rounded bg-zinc-800/40 border border-white/5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-300 block">Paso 2: Ensamblaje</span>
                  <span className="text-[11px] text-zinc-400">
                    Coloca en la columna central: <strong>Tapa</strong> (arriba), <strong>Base metálica</strong> (centro) y <strong>Botón</strong> (abajo).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PESTAÑA: CRAFTEOS VISUALES */}
          {activeTab === "crafting" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBalls.map((ball) => (
                <div
                  key={ball.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/15 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ball.name}</h4>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${ball.accentColor}`}>
                        {ball.catchRate}
                      </span>
                    </div>

                    {/* Mesa de crafteo visual para esta Ball */}
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Crafteo de Tapa (Mesa 3x3):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 w-fit">
                        {ball.apricornTop.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex flex-col items-center justify-center text-center p-0.5"
                          >
                            <span className="text-[7px] font-bold text-zinc-300 truncate w-full">
                              {color}
                            </span>
                          </div>
                        ))}
                        {/* 6 Casillas vacías inferiores */}
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-lg bg-zinc-900/30 border border-white/[0.03]" />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1 border-t border-white/5 font-mono">
                        <span>Base requerida:</span>
                        <span className="text-white font-bold">{ball.baseMaterial}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {ball.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PESTAÑA: BAYAS Y REDUCCIÓN DE EVS */}
          {activeTab === "berries" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBerries.map((berry, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{berry.name}</h4>
                      {berry.evReduced && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {berry.evReduced}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {berry.effect}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Sabor / Uso:</span>
                    <span className="text-zinc-400 font-mono">{berry.flavor}</span>
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
