"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Swords,
  ShieldAlert,
  Gauge,
  Layers,
  Terminal,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { PokemonData } from "@/types/pokemon";

interface PokemonDetailModalProps {
  pokemon: PokemonData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenComparator?: (p: PokemonData) => void;
  onOpenDamageCalc?: (p: PokemonData) => void;
}

const STATS_MAP = [
  { key: "hp", label: "PS", icon: Heart, color: "bg-emerald-400" },
  { key: "attack", label: "Ataque", icon: Swords, color: "bg-amber-400" },
  { key: "defense", label: "Defensa", icon: Shield, color: "bg-orange-400" },
  { key: "specialAttack", label: "At. Esp", icon: Zap, color: "bg-blue-400" },
  { key: "specialDefense", label: "Def. Esp", icon: ShieldAlert, color: "bg-cyan-400" },
  { key: "speed", label: "Velocidad", icon: Gauge, color: "bg-purple-400" },
] as const;

const COMMON_NATURES = [
  "adamant", // Firme (+Atk, -SpA)
  "jolly",   // Alegre (+Spe, -SpA)
  "modest",  // Modesta (+SpA, -Atk)
  "timid",   // Miedosa (+Spe, -Atk)
  "bold",    // Osada (+Def, -Atk)
  "calm",    // Serena (+SpD, -Atk)
  "impish",  // Agitada (+Def, -SpA)
  "careful", // Cauta (+SpD, -SpA)
  "brave",   // Audaz (+Atk, -Spe)
  "quiet",   // Mansa (+SpA, -Spe)
];

export function PokemonDetailModal({
  pokemon,
  isOpen,
  onClose,
  onOpenComparator,
  onOpenDamageCalc,
}: PokemonDetailModalProps) {
  // Configuración del Generador de Comandos Cobblemon
  const [level, setLevel] = useState<number>(50);
  const [nature, setNature] = useState<string>("timid");
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [selectedAbility, setSelectedAbility] = useState<string>("");
  const [ivPreset, setIvPreset] = useState<"6iv" | "special_0atk">("6iv");
  const [commandType, setCommandType] = useState<"pokegive" | "pokespawn">("pokegive");
  const [copied, setCopied] = useState<boolean>(false);

  // Inicializar habilidad al cambiar de Pokémon
  useMemo(() => {
    if (pokemon) {
      setSelectedAbility(pokemon.abilities.primary.toLowerCase().replace(/\s+/g, ""));
    }
  }, [pokemon]);

  if (!isOpen || !pokemon) return null;

  const bst =
    (pokemon.stats?.hp || 0) +
    (pokemon.stats?.attack || 0) +
    (pokemon.stats?.defense || 0) +
    (pokemon.stats?.specialAttack || 0) +
    (pokemon.stats?.specialDefense || 0) +
    (pokemon.stats?.speed || 0);

  // Generador de comando oficial de Cobblemon
  const generatedCommand = useMemo(() => {
    const cleanName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const shinyFlag = isShiny ? " shiny=yes" : "";
    const ivString = ivPreset === "special_0atk" ? "31,0,31,31,31,31" : "31,31,31,31,31,31";
    const abilityStr = selectedAbility ? ` ability=${selectedAbility}` : "";

    if (commandType === "pokegive") {
      return `/pokegive @p ${cleanName} level=${level} nature=${nature}${shinyFlag}${abilityStr} ivs=${ivString}`;
    }
    return `/pokespawn ${cleanName} level=${level} nature=${nature}${shinyFlag}${abilityStr} ivs=${ivString}`;
  }, [pokemon, level, nature, isShiny, selectedAbility, ivPreset, commandType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center p-2 relative">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    #{pokemon.id}
                  </span>
                  <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                    {pokemon.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  {pokemon.types.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TOTAL BASE STATS (BST) */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Suma de Estadísticas Base (BST)
            </span>
            <span className="font-mono font-bold text-sm text-purple-300">
              {bst} pts
            </span>
          </div>

          {/* BARRAS DE ESTADÍSTICAS BASE */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Distribución de Estadísticas Base:
            </span>

            <div className="space-y-2.5">
              {STATS_MAP.map(({ key, label, icon: Icon, color }) => {
                const val = pokemon.stats ? pokemon.stats[key] : 50;
                const percentage = Math.min(100, (val / 180) * 100);

                return (
                  <div key={key} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-zinc-400 font-medium flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-500" />
                      {label}
                    </span>

                    <span className="w-8 text-right font-mono font-bold text-white">
                      {val}
                    </span>

                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GENERADOR DE COMANDO COBBLEMON */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Generador de Comando Cobblemon
              </span>
              <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl p-1 text-[11px] font-mono">
                <button
                  onClick={() => setCommandType("pokegive")}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    commandType === "pokegive"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  /pokegive
                </button>
                <button
                  onClick={() => setCommandType("pokespawn")}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    commandType === "pokespawn"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  /pokespawn
                </button>
              </div>
            </div>

            {/* Opciones del comando */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block mb-1">NIVEL</span>
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
                <span className="text-[10px] text-zinc-500 font-bold block mb-1">NATURALEZA</span>
                <select
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white capitalize focus:outline-none"
                >
                  {COMMON_NATURES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold block mb-1">IVs</span>
                <select
                  value={ivPreset}
                  onChange={(e) => setIvPreset(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="6iv">6 IVs (31)</option>
                  <option value="special_0atk">0 Atk (Especial)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold block mb-1">VARIOCOLOR</span>
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`w-full py-1.5 rounded-xl border text-center transition font-semibold flex items-center justify-center gap-1 ${
                    isShiny
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {isShiny ? "Shiny (Sí)" : "Normal"}
                </button>
              </div>
            </div>

            {/* Cuadro de texto del comando generado con botón de copia */}
            <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-2.5 group">
              <code className="text-xs font-mono text-zinc-300 truncate flex-1 pr-2">
                {generatedCommand}
              </code>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? "bg-emerald-500 text-black font-bold"
                    : "bg-white/[0.06] hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN RÁPIDA */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            {onOpenComparator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenComparator(pokemon);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Comparar 1 vs 1</span>
              </button>
            )}

            {onOpenDamageCalc && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDamageCalc(pokemon);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Calcular Daño</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
