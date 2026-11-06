"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Zap,
  ChevronDown,
  Gauge,
  Swords,
  Shield,
  Heart,
  ShieldAlert,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface MechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tabla simplificada de efectividades elementales
const TYPE_CHART: Record<string, { strong: string[]; weak: string[]; immune: string[] }> = {
  fire: { strong: ["grass", "ice", "bug", "steel"], weak: ["water", "fire", "rock", "dragon"], immune: [] },
  water: { strong: ["fire", "ground", "rock"], weak: ["water", "grass", "dragon"], immune: [] },
  grass: { strong: ["water", "ground", "rock"], weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], immune: [] },
  electric: { strong: ["water", "flying"], weak: ["electric", "grass", "dragon"], immune: ["ground"] },
  ice: { strong: ["grass", "ground", "flying", "dragon"], weak: ["fire", "water", "ice", "steel"], immune: [] },
  fighting: { strong: ["normal", "ice", "rock", "dark", "steel"], weak: ["poison", "flying", "psychic", "bug", "fairy"], immune: ["ghost"] },
  poison: { strong: ["grass", "fairy"], weak: ["poison", "ground", "rock", "ghost"], immune: ["steel"] },
  ground: { strong: ["fire", "electric", "poison", "rock", "steel"], weak: ["grass", "bug"], immune: ["flying"] },
  flying: { strong: ["grass", "fighting", "bug"], weak: ["electric", "rock", "steel"], immune: [] },
  psychic: { strong: ["fighting", "poison"], weak: ["psychic", "steel"], immune: ["dark"] },
  bug: { strong: ["grass", "psychic", "dark"], weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], immune: [] },
  rock: { strong: ["fire", "ice", "flying", "bug"], weak: ["fighting", "ground", "steel"], immune: [] },
  ghost: { strong: ["psychic", "ghost"], weak: ["dark"], immune: ["normal"] },
  dragon: { strong: ["dragon"], weak: ["steel"], immune: ["fairy"] },
  steel: { strong: ["ice", "rock", "fairy"], weak: ["fire", "water", "electric", "steel"], immune: [] },
  dark: { strong: ["psychic", "ghost"], weak: ["fighting", "dark", "fairy"], immune: [] },
  fairy: { strong: ["fighting", "dragon", "dark"], weak: ["fire", "poison", "steel"], immune: [] },
  normal: { strong: [], weak: ["rock", "steel"], immune: ["ghost"] },
};

function calculateTypeMultiplier(attackerTypes: string[], defenderTypes: string[]) {
  let bestMultiplier = 1;

  attackerTypes.forEach((att) => {
    const rules = TYPE_CHART[att.toLowerCase()];
    if (!rules) return;

    let currentMoveMult = 1;
    defenderTypes.forEach((def) => {
      const d = def.toLowerCase();
      if (rules.immune.includes(d)) currentMoveMult *= 0;
      else if (rules.strong.includes(d)) currentMoveMult *= 2;
      else if (rules.weak.includes(d)) currentMoveMult *= 0.5;
    });

    if (currentMoveMult > bestMultiplier) {
      bestMultiplier = currentMoveMult;
    }
  });

  return bestMultiplier;
}

// Selector flotante para cada combatiente
function CombatantPicker({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: PokemonData;
  onSelect: (p: PokemonData) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return SAMPLE_POKEMON.slice(0, 30);
    const q = query.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [query]);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 flex items-center justify-between transition gap-2 group text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={selected?.sprite || ""}
            alt={selected?.name || ""}
            className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">
              {selected?.name}
            </span>
            <span className="text-[10px] text-zinc-400 capitalize">
              #{selected?.id} • {selected?.types.join("/")}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl z-50 p-2 overflow-hidden"
          >
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar combatiente..."
                autoFocus
                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition ${
                      selected.id === p.id
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                        : "hover:bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={p.sprite} alt={p.name} className="w-7 h-7 object-contain shrink-0" />
                      <span className="text-xs font-medium truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">#{p.id}</span>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">No se encontraron Pokémon</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MechanicsModal({ isOpen, onClose }: MechanicsModalProps) {
  const [p1, setP1] = useState<PokemonData>(SAMPLE_POKEMON[0] || ({} as PokemonData));
  const [p2, setP2] = useState<PokemonData>(
    SAMPLE_POKEMON[1] || SAMPLE_POKEMON[0] || ({} as PokemonData)
  );

  const [evs1, setEvs1] = useState(false);
  const [plusNature1, setPlusNature1] = useState(false);
  const [scarf1, setScarf1] = useState(false);

  const [evs2, setEvs2] = useState(false);
  const [plusNature2, setPlusNature2] = useState(false);
  const [scarf2, setScarf2] = useState(false);

  const [level, setLevel] = useState<50 | 100>(50);

  const calcSpeed = (base: number, hasEvs: boolean, hasNature: boolean, hasScarf: boolean) => {
    const iv = 31;
    const ev = hasEvs ? 252 : 0;
    let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    if (hasNature) stat = Math.floor(stat * 1.1);
    if (hasScarf) stat = Math.floor(stat * 1.5);
    return stat;
  };

  const speed1 = useMemo(
    () => calcSpeed(p1.stats?.speed || 50, evs1, plusNature1, scarf1),
    [p1, evs1, plusNature1, scarf1, level]
  );
  const speed2 = useMemo(
    () => calcSpeed(p2.stats?.speed || 50, evs2, plusNature2, scarf2),
    [p2, evs2, plusNature2, scarf2, level]
  );

  const p1AgainstP2 = useMemo(() => calculateTypeMultiplier(p1.types || [], p2.types || []), [p1, p2]);
  const p2AgainstP1 = useMemo(() => calculateTypeMultiplier(p2.types || [], p1.types || []), [p1, p2]);

  const matchupSummary = useMemo(() => {
    if (p1AgainstP2 >= 2 && speed1 > speed2) {
      return { winner: p1.name, text: `${p1.name} ataca primero con ventaja de tipo (Probable OHKO).` };
    }
    if (p2AgainstP1 >= 2 && speed2 > speed1) {
      return { winner: p2.name, text: `${p2.name} ataca primero con ventaja de tipo (Probable OHKO).` };
    }
    if (speed1 > speed2) {
      return { winner: p1.name, text: `${p1.name} ataca primero (+${speed1 - speed2} pts de velocidad).` };
    }
    if (speed2 > speed1) {
      return { winner: p2.name, text: `${p2.name} ataca primero (+${speed2 - speed1} pts de velocidad).` };
    }
    return { winner: "Empate", text: "Velocidades idénticas (Speed Tie del 50%)." };
  }, [p1, p2, speed1, speed2, p1AgainstP2, p2AgainstP1]);

  if (!isOpen) return null;

  const STATS_LIST = [
    { key: "hp", label: "PS", icon: Heart },
    { key: "attack", label: "Ataque", icon: Swords },
    { key: "defense", label: "Defensa", icon: Shield },
    { key: "specialAttack", label: "At. Esp", icon: Zap },
    { key: "specialDefense", label: "Def. Esp", icon: ShieldAlert },
    { key: "speed", label: "Velocidad", icon: Gauge },
  ] as const;

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
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Comparador 1 vs 1 & Speed Tiers
                </h2>
                <p className="text-xs text-zinc-400">
                  Enfrentamiento directo de stats base, turnos de ataque y efectividades
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs font-mono">
                <button
                  onClick={() => setLevel(50)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    level === 50 ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Nivel 50
                </button>
                <button
                  onClick={() => setLevel(100)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    level === 100 ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Nivel 100
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* COMBATIENTES ENFRENTADOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Combatiente 1 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <CombatantPicker label="Combatiente 1" selected={p1} onSelect={(p) => setP1(p)} />

              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Modificadores de Velocidad:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setEvs1(!evs1)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      evs1 ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    252 EVs
                  </button>
                  <button
                    onClick={() => setPlusNature1(!plusNature1)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      plusNature1 ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    +Naturaleza (1.1x)
                  </button>
                  <button
                    onClick={() => setScarf1(!scarf1)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      scarf1 ? "bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    Scarf (1.5x)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Velocidad en combate:</span>
                <span className="text-xl font-bold font-mono text-amber-300">{speed1} <span className="text-xs font-sans text-zinc-500">Spe</span></span>
              </div>
            </div>

            {/* Combatiente 2 */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <CombatantPicker label="Combatiente 2" selected={p2} onSelect={(p) => setP2(p)} />

              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Modificadores de Velocidad:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setEvs2(!evs2)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      evs2 ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    252 EVs
                  </button>
                  <button
                    onClick={() => setPlusNature2(!plusNature2)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      plusNature2 ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    +Naturaleza (1.1x)
                  </button>
                  <button
                    onClick={() => setScarf2(!scarf2)}
                    className={`py-1.5 rounded-lg border text-center transition font-mono ${
                      scarf2 ? "bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold" : "bg-white/[0.02] border-white/5 text-zinc-500"
                    }`}
                  >
                    Scarf (1.5x)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Velocidad en combate:</span>
                <span className="text-xl font-bold font-mono text-purple-300">{speed2} <span className="text-xs font-sans text-zinc-500">Spe</span></span>
              </div>
            </div>
          </div>

          {/* VEREDICTO CENTRAL DE SPEED TIER */}
          <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Veredicto de Iniciativa de Turno
                </span>
                <span className="text-xs text-zinc-400">{matchupSummary.text}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 font-mono text-xs text-amber-300 font-bold">
              Diferencia: {Math.abs(speed1 - speed2)} pts
            </div>
          </div>

          {/* CRUCE DE EFECTIVIDADES ELEMENTALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-400">STAB de <b>{p1.name}</b> sobre {p2.name}:</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${
                  p1AgainstP2 >= 2
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : p1AgainstP2 === 1
                    ? "bg-white/[0.04] border-white/10 text-zinc-300"
                    : p1AgainstP2 === 0
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                {p1AgainstP2 === 0 ? "Inmune (x0)" : `Daño x${p1AgainstP2}`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-400">STAB de <b>{p2.name}</b> sobre {p1.name}:</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${
                  p2AgainstP1 >= 2
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : p2AgainstP1 === 1
                    ? "bg-white/[0.04] border-white/10 text-zinc-300"
                    : p2AgainstP1 === 0
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                {p2AgainstP1 === 0 ? "Inmune (x0)" : `Daño x${p2AgainstP1}`}
              </span>
            </div>
          </div>

          {/* BASE STATS COMPARATIVO */}
          <div className="mt-5 p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Base Stats Comparativo
            </h4>

            <div className="space-y-2.5">
              {STATS_LIST.map(({ key, label }) => {
                const v1 = p1.stats ? p1.stats[key] : 50;
                const v2 = p2.stats ? p2.stats[key] : 50;
                const max = 200;

                return (
                  <div key={key} className="flex items-center gap-3 text-xs">
                    {/* Stat P1 */}
                    <span className="w-8 text-right font-mono font-bold text-zinc-300">
                      {v1}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (v1 / max) * 100)}%` }}
                      />
                    </div>

                    {/* Label central */}
                    <span className="w-20 text-center text-zinc-400 font-medium text-[11px]">
                      {label}
                    </span>

                    {/* Stat P2 */}
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (v2 / max) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-left font-mono font-bold text-zinc-300">
                      {v2}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
