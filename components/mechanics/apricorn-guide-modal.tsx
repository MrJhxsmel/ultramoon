"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Apple,
  Search,
  Hammer,
  Sparkles,
  Layers,
  Heart,
  ShieldAlert,
  Info,
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
  apricorns: string;
  catchRate: string;
  description: string;
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
    apricorns: "4x Apricorn Roja",
    catchRate: "1.0x (Estándar)",
    description: "La esfera básica de captura. Requiere 4 apricorns rojas y 1 lingote de cobre en mesa de crafteo.",
  },
  {
    id: "great-ball",
    name: "Súper Ball",
    englishName: "Great Ball",
    baseMaterial: "Hierro",
    apricorns: "2x Apricorn Azul + 2x Apricorn Roja",
    catchRate: "1.5x",
    description: "Esfera de rendimiento mejorado. Requiere lingote de hierro y combinación azul/roja.",
  },
  {
    id: "ultra-ball",
    name: "Ultra Ball",
    englishName: "Ultra Ball",
    baseMaterial: "Oro",
    apricorns: "2x Apricorn Negra + 2x Apricorn Amarilla",
    catchRate: "2.0x",
    description: "Alta tasa para especies difíciles. Se forja con 1 lingote de oro en mesa de crafteo.",
  },
  {
    id: "dusk-ball",
    name: "Ocaso Ball",
    englishName: "Dusk Ball",
    baseMaterial: "Hierro",
    apricorns: "2x Apricorn Verde + 2x Apricorn Negra",
    catchRate: "3.0x de noche o en cuevas",
    description: "Muy eficaz de noche o en profundidades (Y < 60). Base de lingote de hierro.",
  },
  {
    id: "quick-ball",
    name: "Veloz Ball",
    englishName: "Fast Ball",
    baseMaterial: "Hierro",
    apricorns: "1x Roja + 2x Amarilla + 1x Blanca",
    catchRate: "4.0x a velocidad > 100",
    description: "Gran eficacia contra especies ágiles con velocidad base de 100 o superior.",
  },
  {
    id: "timer-ball",
    name: "Turno Ball",
    englishName: "Timer Ball",
    baseMaterial: "Hierro",
    apricorns: "2x Apricorn Blanca + 1x Roja + 1x Negra",
    catchRate: "1.0x hasta 4.0x según turnos",
    description: "Aumenta gradualmente su efectividad por cada turno de combate transcurrido.",
  },
  {
    id: "dive-ball",
    name: "Buceo Ball",
    englishName: "Dive Ball",
    baseMaterial: "Hierro",
    apricorns: "3x Apricorn Azul + 1x Apricorn Blanca",
    catchRate: "3.5x bajo el agua",
    description: "Efectividad aumentada en biomas oceánicos o cuando el objetivo está sumergido.",
  },
  {
    id: "net-ball",
    name: "Malla Ball",
    englishName: "Net Ball",
    baseMaterial: "Hierro",
    apricorns: "2x Apricorn Azul + 1x Negra + 1x Blanca",
    catchRate: "3.0x contra Agua y Bicho",
    description: "Bonificador directo contra objetivos de tipo Agua o Bicho.",
  },
  {
    id: "cobble-ball",
    name: "Cobble Ball",
    englishName: "Slate Ball",
    baseMaterial: "Cobre",
    apricorns: "4x Apricorn Negra",
    catchRate: "1.0x (Exclusiva Cobblemon)",
    description: "Esfera temática elaborada a base de apricorns negras y cobre.",
  },
];

const BERRIES_DATA: BerryEntry[] = [
  { name: "Baya Grana (Pomeg)", effect: "Aumenta felicidad y reduce 10 EVs en HP.", evReduced: "HP (-10)", flavor: "Dulce / Ácida", category: "ev_reduction" },
  { name: "Baya Algama (Kelpsy)", effect: "Aumenta felicidad y reduce 10 EVs en Ataque.", evReduced: "Ataque (-10)", flavor: "Seca / Amarga", category: "ev_reduction" },
  { name: "Baya Ispero (Qualot)", effect: "Aumenta felicidad y reduce 10 EVs en Defensa.", evReduced: "Defensa (-10)", flavor: "Dulce / Picante", category: "ev_reduction" },
  { name: "Baya Meluce (Hondew)", effect: "Aumenta felicidad y reduce 10 EVs en Atq. Especial.", evReduced: "Atq. Esp (-10)", flavor: "Ácida / Amarga", category: "ev_reduction" },
  { name: "Baya Uva (Grepa)", effect: "Aumenta felicidad y reduce 10 EVs en Def. Especial.", evReduced: "Def. Esp (-10)", flavor: "Dulce / Seca", category: "ev_reduction" },
  { name: "Baya Tamate (Tamato)", effect: "Aumenta felicidad y reduce 10 EVs en Velocidad.", evReduced: "Velocidad (-10)", flavor: "Picante / Seca", category: "ev_reduction" },
  { name: "Baya Zidra (Sitrus)", effect: "Restaura el 25% de los PS máximos cuando cae por debajo del 50%.", flavor: "Equilibrada", category: "combat" },
  { name: "Baya Ziuela (Lum)", effect: "Cura cualquier estado alterado (parálisis, sueño, veneno, quemadura, congelación).", flavor: "Equilibrada", category: "combat" },
  { name: "Hierba Copia (Mirror Herb)", effect: "Permite transferir movimientos huevo entre Pokémon en el Pasture Block.", flavor: "Especial", category: "breeding" },
];

export function ApricornGuideModal({ isOpen, onClose }: ApricornGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"balls" | "berries">("balls");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBalls = useMemo(() => {
    if (!searchQuery.trim()) return BALL_RECIPES;
    const q = searchQuery.toLowerCase();
    return BALL_RECIPES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.englishName.toLowerCase().includes(q) ||
        b.apricorns.toLowerCase().includes(q) ||
        b.baseMaterial.toLowerCase().includes(q)
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
          {/* Encabezado */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Apple className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Guía de Apricorns & Bayas de Cobblemon
                </h2>
                <p className="text-xs text-zinc-400">
                  Crafteos en mesa de trabajo, reducción de EVs y efectos de cosecha
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

          {/* Navegación y Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("balls")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "balls"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Crafteo de Poké Balls</span>
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
                placeholder="Buscar por nombre, receta o efecto..."
                className="w-full sm:w-64 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* REGLA OFICIAL DE COBBLEMON CORREGIDA */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-zinc-300">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                Mecánica oficial de Cobblemon en Minecraft:
              </span>
              <p className="text-[11px] text-zinc-300/90 leading-relaxed">
                En Cobblemon <strong>no se cocinan apricorns en hornos ni se martillan en yunques</strong>. Las Poké Balls se fabrican directamente en la <strong>Mesa de Crafteo</strong> colocando 4 Apricorns crudos según el color deseado junto al lingote correspondiente (Cobre para Poké Balls básicas, Hierro para Súper/especiales y Oro para Ultra Ball).
              </p>
            </div>
          </div>

          {/* PESTAÑA: CRAFTEO DE POKÉ BALLS */}
          {activeTab === "balls" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBalls.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{b.name}</h4>
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                          b.baseMaterial === "Oro"
                            ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                            : b.baseMaterial === "Hierro"
                            ? "bg-slate-300/10 text-slate-300 border-slate-400/20"
                            : "bg-orange-600/10 text-orange-300 border-orange-600/20"
                        }`}
                      >
                        Base: {b.baseMaterial}
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-300 font-mono font-medium">
                      {b.apricorns}
                    </p>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Ratio de Captura:</span>
                    <span className="text-emerald-400 font-bold">{b.catchRate}</span>
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
