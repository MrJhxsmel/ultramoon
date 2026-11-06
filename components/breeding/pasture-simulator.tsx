"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Egg,
  Sparkles,
  Heart,
  Copy,
  Check,
  Search,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface PastureSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const BREEDING_ITEMS = [
  { id: "none", name: "Sin objeto" },
  { id: "destiny_knot", name: "Lazo Destino (Hereda 5 IVs de los padres)" },
  { id: "everstone", name: "Piedra Eterna (Hereda 100% la Naturaleza)" },
  { id: "mirror_herb", name: "Hierba Copia (Transfiere Egg Moves)" },
  { id: "power_weight", name: "Pesa Recia (Hereda 100% IV HP)", stat: "hp" },
  { id: "power_bracer", name: "Brazal Recio (Hereda 100% IV Ataque)", stat: "attack" },
  { id: "power_belt", name: "Cinto Recio (Hereda 100% IV Defensa)", stat: "defense" },
  { id: "power_lens", name: "Lente Recia (Hereda 100% IV Atq. Especial)", stat: "specialAttack" },
  { id: "power_band", name: "Banda Recia (Hereda 100% IV Def. Especial)", stat: "specialDefense" },
  { id: "power_anklet", name: "Franja Recia (Hereda 100% IV Velocidad)", stat: "speed" },
];

export function PastureSimulator({ isOpen, onClose }: PastureSimulatorProps) {
  const [parent1, setParent1] = useState<PokemonData>(ALL_POKEMON[0]);
  const [parent2, setParent2] = useState<PokemonData>(ALL_POKEMON[1] || ALL_POKEMON[0]);

  const [item1, setItem1] = useState("destiny_knot");
  const [item2, setItem2] = useState("everstone");

  const [copiedCommand, setCopiedCommand] = useState(false);

  // Verificación de compatibilidad de grupo huevo
  const isCompatible = useMemo(() => {
    if (parent1.id === parent2.id) return true;
    return parent1.eggGroups.some((g) => parent2.eggGroups.includes(g));
  }, [parent1, parent2]);

  // Generador de comando /pokegive de cría
  const generatedGiveCommand = useMemo(() => {
    const babyName = parent2.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `/pokegive @p ${babyName} level=1 ivs=31,31,31,31,31,31 shiny=false`;
  }, [parent2]);

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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Egg className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pasture Block & Crianza</h2>
                <p className="text-xs text-zinc-400">
                  Simulación de herencia de IVs, Objetos Recios y comandos /pokegive
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progenitores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Padre 1 */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-blue-400">Progenitor 1 (Macho / Base)</span>
                <select
                  value={parent1.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setParent1(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 80).map((p) => (
                    <option key={p.id + p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={parent1.sprite} alt={parent1.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-xs font-bold text-white">{parent1.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Grupos: {parent1.eggGroups.join(", ")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Objeto Equipado:</span>
                <select
                  value={item1}
                  onChange={(e) => setItem1(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {BREEDING_ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Padre 2 */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-rose-400">Progenitor 2 (Hembra / Cría)</span>
                <select
                  value={parent2.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setParent2(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 80).map((p) => (
                    <option key={p.id + p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={parent2.sprite} alt={parent2.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-xs font-bold text-white">{parent2.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Grupos: {parent2.eggGroups.join(", ")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Objeto Equipado:</span>
                <select
                  value={item2}
                  onChange={(e) => setItem2(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {BREEDING_ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estado de Compatibilidad y Cría */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isCompatible ? "text-rose-400" : "text-zinc-600"}`} />
                Resultado en Pasture Block:
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isCompatible
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}>
                {isCompatible ? "Compatibles (Genera Huevo)" : "Incompatibles (Grupos distintos)"}
              </span>
            </div>

            {/* Comando /pokegive de Cría */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-zinc-300 font-mono">{generatedGiveCommand}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedGiveCommand);
                  setCopiedCommand(true);
                  setTimeout(() => setCopiedCommand(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? "Copiado" : "Copiar Comando"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
