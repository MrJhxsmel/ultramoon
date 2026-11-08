"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Terminal,
  Copy,
  Check,
  Search,
  Sparkles,
  Shield,
  Layers,
  Wand2,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface ServerCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const KEY_ITEMS = [
  { id: "cobblemon:destiny_knot", name: "Lazo Destino" },
  { id: "cobblemon:everstone", name: "Piedra Eterna" },
  { id: "cobblemon:soothe_bell", name: "Campana Alivio" },
  { id: "cobblemon:power_weight", name: "Pesa Recia (HP)" },
  { id: "cobblemon:power_bracer", name: "Brazal Recio (Atq)" },
  { id: "cobblemon:power_belt", name: "Cinto Recio (Def)" },
  { id: "cobblemon:power_lens", name: "Lente Recia (SpA)" },
  { id: "cobblemon:power_band", name: "Banda Recia (SpD)" },
  { id: "cobblemon:power_anklet", name: "Franja Recia (Vel)" },
  { id: "cobblemon:rare_candy", name: "Caramelo Raro" },
  { id: "cobblemon:exp_candy_xl", name: "Caramelo Exp XL" },
  { id: "cobblemon:ultra_ball", name: "Ultra Ball x64" },
];

export function ServerCommandsModal({ isOpen, onClose }: ServerCommandsModalProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData>(ALL_POKEMON[5] || ALL_POKEMON[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetPlayer, setTargetPlayer] = useState("@p");
  const [level, setLevel] = useState(50);
  const [isShiny, setIsShiny] = useState(false);
  const [perfectIvs, setPerfectIvs] = useState(true);
  const [maxFriendship, setMaxFriendship] = useState(false);
  const [nature, setNature] = useState("jolly");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const availablePokemon = useMemo(() => {
    if (!searchQuery.trim()) return ALL_POKEMON.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return ALL_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q)
    ).slice(0, 20);
  }, [searchQuery]);

  const cleanName = selectedPokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Comandos generados
  const pokegiveCmd = useMemo(() => {
    const ivsStr = perfectIvs ? "ivs=31,31,31,31,31,31" : "";
    const shinyStr = isShiny ? "shiny=yes" : "shiny=no";
    const friendStr = maxFriendship ? "friendship=220" : "";
    const parts = [
      `/pokegive ${targetPlayer} ${cleanName}`,
      `level=${level}`,
      `nature=${nature}`,
      shinyStr,
      ivsStr,
      friendStr,
    ].filter(Boolean);

    return parts.join(" ");
  }, [targetPlayer, cleanName, level, nature, isShiny, perfectIvs, maxFriendship]);

  const pokespawnCmd = useMemo(() => {
    return `/pokespawn ${cleanName} level=${level} shiny=${isShiny ? "yes" : "no"}`;
  }, [cleanName, level, isShiny]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generador de Comandos Cobblemon</h2>
                <p className="text-xs text-zinc-400">
                  Comandos de consola y admin (/pokegive, /pokespawn, /give) listos para copiar
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Configuración de Pokémon */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-white capitalize">{selectedPokemon.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">ID #{selectedPokemon.id}</span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cambiar Pokémon..."
                  className="bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 w-full sm:w-52"
                />
              </div>
            </div>

            {searchQuery.trim() && (
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2 custom-scrollbar">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Destinatario:</span>
                <input
                  type="text"
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Nivel ({level}):</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Naturaleza:</span>
                <select
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {["jolly", "timid", "adamant", "modest", "bold", "calm", "impish", "careful", "brave", "quiet"].map((n) => (
                    <option key={n} value={n}>{n.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition border ${
                    isShiny ? "bg-amber-400 text-black border-amber-300" : "bg-zinc-950 text-zinc-400 border-white/10"
                  }`}
                >
                  {isShiny ? "✨ Variocolor (Shiny)" : "Normal"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <button
                onClick={() => setPerfectIvs(!perfectIvs)}
                className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
                  perfectIvs ? "bg-purple-600/30 text-purple-300 border-purple-500/50" : "bg-zinc-950 text-zinc-500 border-white/5"
                }`}
              >
                6 IVs Perfectos (31x6)
              </button>

              <button
                onClick={() => setMaxFriendship(!maxFriendship)}
                className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
                  maxFriendship ? "bg-rose-600/30 text-rose-300 border-rose-500/50" : "bg-zinc-950 text-zinc-500 border-white/5"
                }`}
              >
                Amistad Máxima (220)
              </button>
            </div>
          </div>

          {/* Comandos Resultantes */}
          <div className="space-y-3">
            {/* Pokegive */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Comando /pokegive (Inventario directo)</span>
                <code className="text-xs text-zinc-200 font-mono truncate block mt-0.5">{pokegiveCmd}</code>
              </div>
              <button
                onClick={() => handleCopy(pokegiveCmd, "pokegive")}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedKey === "pokegive" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "pokegive" ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            {/* Pokespawn */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">Comando /pokespawn (Generar salvaje)</span>
                <code className="text-xs text-zinc-200 font-mono truncate block mt-0.5">{pokespawnCmd}</code>
              </div>
              <button
                onClick={() => handleCopy(pokespawnCmd, "pokespawn")}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedKey === "pokespawn" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "pokespawn" ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {/* Comandos Rápidos de Ítems Clave */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Comandos /give de Ítems Competitivos en Minecraft:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KEY_ITEMS.map((item) => {
                const cmd = `/give @p ${item.id} 1`;
                const isItemCopied = copiedKey === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCopy(cmd, item.id)}
                    className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 text-left transition flex items-center justify-between group"
                  >
                    <span className="text-xs font-semibold text-zinc-300 truncate">{item.name}</span>
                    {isItemCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
