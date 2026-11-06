"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crosshair,
  Search,
  Sparkles,
  ChevronDown,
  Percent,
  Sliders,
  Moon,
  Sun,
  Clock,
  CircleDot,
  Layers,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface CaptureCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StatusCondition = "none" | "sleep_freeze" | "par_psn_brn";

interface PokeBallData {
  id: string;
  name: string;
  rateMultiplier: number;
  description: string;
  crafting: string;
  badgeColor: string;
}

const BALLS_CONFIG: PokeBallData[] = [
  {
    id: "poke_ball",
    name: "Poké Ball",
    rateMultiplier: 1,
    description: "Ball estándar básica.",
    crafting: "Apricorns Rojas + Base de Cobre/Hierro",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    id: "great_ball",
    name: "Súper Ball",
    rateMultiplier: 1.5,
    description: "Mejor tasa de captura estándar.",
    crafting: "Apricorns Azules/Rojas + Base de Hierro",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "ultra_ball",
    name: "Ultra Ball",
    rateMultiplier: 2.0,
    description: "Rendimiento óptimo para especies difíciles.",
    crafting: "Apricorns Negras/Amarillas + Base de Oro",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "dusk_ball",
    name: "Ocaso Ball (Dusk Ball)",
    rateMultiplier: 3.0,
    description: "Máxima efectividad de noche o dentro de cuevas (Y < 60).",
    crafting: "Apricorns Negras/Verdes + Base de Hierro",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "quick_ball",
    name: "Veloz Ball (Quick Ball)",
    rateMultiplier: 5.0,
    description: "Multiplicador x5 si se lanza en el primer turno.",
    crafting: "Apricorns Azules/Amarillas + Base de Hierro",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "timer_ball",
    name: "Turno Ball (Timer Ball)",
    rateMultiplier: 3.5,
    description: "Aumenta tras varios turnos de combate prolongado.",
    crafting: "Apricorns Blancas/Rojas + Base de Hierro",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    id: "cobble_ball",
    name: "Cobble Ball",
    rateMultiplier: 1.25,
    description: "Ball artesanal típica forjada en Minecraft.",
    crafting: "Apricorns Negras/Rojas + Lingote de Hierro",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
];

// Tasa de captura estimada según especie o BST
function getEstimatedCatchRate(p: PokemonData): number {
  const bst =
    (p.stats?.hp || 0) +
    (p.stats?.attack || 0) +
    (p.stats?.defense || 0) +
    (p.stats?.specialAttack || 0) +
    (p.stats?.specialDefense || 0) +
    (p.stats?.speed || 0);

  if (bst >= 580) return 3; // Legendarios / Míticos
  if (bst >= 500) return 45; // Etapas finales fuertes
  if (bst >= 400) return 75; // Etapas intermedias
  if (bst >= 300) return 190; // Iniciales / fase temprana
  return 255; // Especies muy fáciles (Caterpie, Magikarp, etc.)
}

export function CaptureCalculatorModal({ isOpen, onClose }: CaptureCalculatorModalProps) {
  const [targetPokemon, setTargetPokemon] = useState<PokemonData>(SAMPLE_POKEMON[0]);
  const [level, setLevel] = useState<number>(25);
  const [hpPercentage, setHpPercentage] = useState<number>(30); // 1% a 100%
  const [status, setStatus] = useState<StatusCondition>("none");
  const [isNightOrCave, setIsNightOrCave] = useState<boolean>(true);
  const [isTurnOne, setIsTurnOne] = useState<boolean>(false);

  // Buscador flotante
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_POKEMON.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [searchQuery]);

  // FÓRMULA OFICIAL DE CAPTURA (Gen 8/9 / Cobblemon)
  // modifiedRate = [ ( (3 * MaxHP - 2 * CurrHP) * CatchRate * BallBonus ) / (3 * MaxHP) ] * StatusBonus
  const results = useMemo(() => {
    const maxHP = Math.floor(((2 * targetPokemon.stats.hp + 31) * level) / 100) + level + 10;
    const currentHP = Math.max(1, Math.floor((maxHP * hpPercentage) / 100));
    const baseCatchRate = getEstimatedCatchRate(targetPokemon);

    let statusMultiplier = 1;
    if (status === "sleep_freeze") statusMultiplier = 2.5;
    else if (status === "par_psn_brn") statusMultiplier = 1.5;

    return BALLS_CONFIG.map((ball) => {
      let multiplier = ball.rateMultiplier;

      // Condiciones contextuales
      if (ball.id === "dusk_ball" && !isNightOrCave) multiplier = 1.0;
      if (ball.id === "quick_ball" && !isTurnOne) multiplier = 1.0;

      const hpFactor = (3 * maxHP - 2 * currentHP) / (3 * maxHP);
      let a = hpFactor * baseCatchRate * multiplier * statusMultiplier;

      let catchPercentage = 0;
      if (a >= 255) {
        catchPercentage = 100;
      } else {
        // Probabilidad por sacudida (Shake probability b = 65536 * (a/255)^(1/4))
        const b = 65536 * Math.pow(a / 255, 0.75);
        const singleShakeChance = Math.min(65536, b) / 65536;
        catchPercentage = Math.pow(singleShakeChance, 4) * 100;
      }

      return {
        ...ball,
        appliedMultiplier: multiplier,
        percentage: Math.min(100, Math.max(0.1, Number(catchPercentage.toFixed(1)))),
      };
    });
  }, [targetPokemon, level, hpPercentage, status, isNightOrCave, isTurnOne]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Calculadora de Captura (Cobblemon)
                </h2>
                <p className="text-xs text-zinc-400">
                  Tasas matemáticas de éxito por Poké Ball, recetas y estado alterado
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PARÁMETROS DEL POKÉMON OBJETIVO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de Pokémon */}
            <div className="relative" ref={dropdownRef}>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Pokémon Salvaje:
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="w-full p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] flex items-center justify-between transition gap-2 group text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={targetPokemon.sprite}
                    alt={targetPokemon.name}
                    className="w-9 h-9 object-contain shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">
                      {targetPokemon.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Catch Rate Base: {getEstimatedCatchRate(targetPokemon)}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              </button>

              <AnimatePresence>
                {isPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar especie..."
                        autoFocus
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {filtered.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setTargetPokemon(p);
                            setIsPickerOpen(false);
                            setSearchQuery("");
                          }}
                          className="w-full p-2 rounded-xl flex items-center justify-between text-left hover:bg-white/[0.06] text-zinc-300"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={p.sprite} alt={p.name} className="w-7 h-7 object-contain" />
                            <span className="text-xs">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">#{p.id}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nivel del Pokémon */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Nivel Salvaje:
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  Lv. {level}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Porcentaje de Salud Restante */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  PS Restantes:
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {hpPercentage}% de salud
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={hpPercentage}
                onChange={(e) => setHpPercentage(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* CONDICIONES DE COMBATE Y ENTORNO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06]">
            {/* Estado Alterado */}
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Condición de Estado:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                <button
                  onClick={() => setStatus("none")}
                  className={`py-1.5 rounded-xl border text-center transition ${
                    status === "none"
                      ? "bg-white/10 border-white/20 text-white font-bold"
                      : "bg-white/[0.02] border-white/5 text-zinc-500"
                  }`}
                >
                  Ninguno (1x)
                </button>
                <button
                  onClick={() => setStatus("sleep_freeze")}
                  className={`py-1.5 rounded-xl border text-center transition ${
                    status === "sleep_freeze"
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold"
                      : "bg-white/[0.02] border-white/5 text-zinc-500"
                  }`}
                >
                  Sueño / Hielo (2.5x)
                </button>
                <button
                  onClick={() => setStatus("par_psn_brn")}
                  className={`py-1.5 rounded-xl border text-center transition ${
                    status === "par_psn_brn"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                      : "bg-white/[0.02] border-white/5 text-zinc-500"
                  }`}
                >
                  Parál / Quem (1.5x)
                </button>
              </div>
            </div>

            {/* Contexto de Minecraft */}
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Factores del Mundo:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIsNightOrCave(!isNightOrCave)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    isNightOrCave
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-white/[0.02] border-white/5 text-zinc-500"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Noche / Cueva (Ocaso)</span>
                </button>

                <button
                  onClick={() => setIsTurnOne(!isTurnOne)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    isTurnOne
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold"
                      : "bg-white/[0.02] border-white/5 text-zinc-500"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Turno 1 (Veloz Ball)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLA DE EFECTIVIDAD POR POKÉ BALL */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Probabilidad de Éxito por Ball:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((ball) => (
                <div
                  key={ball.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ball.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${ball.badgeColor}`}>
                          {ball.appliedMultiplier}x
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{ball.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-base font-mono font-bold ${
                          ball.percentage >= 80
                            ? "text-emerald-400"
                            : ball.percentage >= 40
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {ball.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de probabilidad */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ball.percentage >= 80
                          ? "bg-emerald-500"
                          : ball.percentage >= 40
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${ball.percentage}%` }}
                    />
                  </div>

                  <span className="text-[9px] text-zinc-500 font-mono truncate block">
                    Crafteo: {ball.crafting}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
