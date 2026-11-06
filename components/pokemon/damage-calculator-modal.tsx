"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Swords,
  Search,
  Zap,
  Shield,
  Heart,
  ChevronDown,
  Sun,
  CloudRain,
  Wind,
  Sparkles,
  Layers,
  Flame,
  Droplet,
  Plus,
  Minus,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface DamageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPokemon?: PokemonData | null;
}

type Weather = "none" | "sun" | "rain" | "sand";
type Terrain = "none" | "electric" | "grassy" | "psychic";

interface MoveData {
  name: string;
  type: string;
  category: "physical" | "special";
  bp: number;
}

const COMMON_MOVES_BY_TYPE: Record<string, MoveData[]> = {
  fire: [
    { name: "Lanzallamas", type: "fire", category: "special", bp: 90 },
    { name: "Envite Ígneo", type: "fire", category: "physical", bp: 120 },
    { name: "Llamarada", type: "fire", category: "special", bp: 110 },
  ],
  water: [
    { name: "Surf", type: "water", category: "special", bp: 90 },
    { name: "Hidrobomba", type: "water", category: "special", bp: 110 },
    { name: "Cascada", type: "water", category: "physical", bp: 80 },
  ],
  grass: [
    { name: "Giga Drenado", type: "grass", category: "special", bp: 75 },
    { name: "Latigazo", type: "grass", category: "physical", bp: 120 },
    { name: "Energibola", type: "grass", category: "special", bp: 90 },
  ],
  electric: [
    { name: "Rayo", type: "electric", category: "special", bp: 90 },
    { name: "Voltio Cruel", type: "electric", category: "physical", bp: 90 },
  ],
  ghost: [
    { name: "Bola Sombra", type: "ghost", category: "special", bp: 80 },
    { name: "Garra Umbría", type: "ghost", category: "physical", bp: 70 },
  ],
  dragon: [
    { name: "Garra Dragón", type: "dragon", category: "physical", bp: 80 },
    { name: "Pulso Dragón", type: "dragon", category: "special", bp: 85 },
  ],
  fighting: [
    { name: "A Bocajarro", type: "fighting", category: "physical", bp: 120 },
    { name: "Onda Certera", type: "fighting", category: "special", bp: 120 },
  ],
  ground: [
    { name: "Terremoto", type: "ground", category: "physical", bp: 100 },
    { name: "Tierra Viva", type: "ground", category: "special", bp: 90 },
  ],
  flying: [
    { name: "Pájaro Osado", type: "flying", category: "physical", bp: 120 },
    { name: "Tajo Aéreo", type: "flying", category: "special", bp: 75 },
  ],
  default: [
    { name: "Fuerza Bruta", type: "normal", category: "physical", bp: 80 },
    { name: "Rapidez", type: "normal", category: "special", bp: 60 },
  ],
};

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

function PokemonPicker({
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
        className="w-full p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 flex items-center justify-between transition gap-2 group text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={selected?.sprite || ""}
            alt={selected?.name || ""}
            className="w-9 h-9 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">
              {selected?.name}
            </span>
            <span className="text-[10px] text-zinc-400 capitalize">
              #{selected?.id} • {selected?.types?.join("/")}
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

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
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
                      selected?.id === p.id
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

export function DamageCalculatorModal({
  isOpen,
  onClose,
  initialPokemon,
}: DamageCalculatorModalProps) {
  const [attacker, setAttacker] = useState<PokemonData>(SAMPLE_POKEMON[3] || SAMPLE_POKEMON[0]); // Charmander
  const [defender, setDefender] = useState<PokemonData>(SAMPLE_POKEMON[0]); // Bulbasaur

  // Sincroniza el Pokémon recibido desde la ficha técnica como Atacante
  useEffect(() => {
    if (initialPokemon) {
      setAttacker(initialPokemon);
    }
  }, [initialPokemon]);

  // Configuración de Ataque
  const [attackerBoost, setAttackerBoost] = useState<number>(0);
  const [attackerItem, setAttackerItem] = useState<"none" | "life_orb" | "choice">("none");

  // Configuración de Defensa
  const [defenderBoost, setDefenderBoost] = useState<number>(0);
  const [defenderItem, setDefenderItem] = useState<"none" | "assault_vest" | "eviolite">("none");

  // Clima y Terreno de Minecraft
  const [weather, setWeather] = useState<Weather>("none");
  const [terrain, setTerrain] = useState<Terrain>("none");

  // Movimientos disponibles para el atacante
  const availableMoves = useMemo(() => {
    const list: MoveData[] = [];
    attacker?.types?.forEach((t) => {
      if (COMMON_MOVES_BY_TYPE[t]) {
        list.push(...COMMON_MOVES_BY_TYPE[t]);
      }
    });
    return list.length > 0 ? list.slice(0, 4) : COMMON_MOVES_BY_TYPE.default;
  }, [attacker]);

  const [selectedMove, setSelectedMove] = useState<MoveData>(availableMoves[0]);

  useEffect(() => {
    if (availableMoves.length > 0) {
      setSelectedMove(availableMoves[0]);
    }
  }, [availableMoves]);

  // CÁLCULO OFICIAL DE DAÑO (Fórmula Showdown VGC Nivel 50)
  const calculation = useMemo(() => {
    const level = 50;

    const atkStatBase =
      selectedMove.category === "physical"
        ? attacker?.stats?.attack || 50
        : attacker?.stats?.specialAttack || 50;
    let attack = Math.floor(((2 * atkStatBase + 31 + 63) * level) / 100) + 5;

    const boostMult =
      attackerBoost >= 0
        ? (2 + attackerBoost) / 2
        : 2 / (2 - attackerBoost);
    attack = Math.floor(attack * boostMult);

    if (attackerItem === "life_orb") attack = Math.floor(attack * 1.3);
    if (attackerItem === "choice") attack = Math.floor(attack * 1.5);

    const defStatBase =
      selectedMove.category === "physical"
        ? defender?.stats?.defense || 50
        : defender?.stats?.specialDefense || 50;
    let defense = Math.floor(((2 * defStatBase + 31 + 31) * level) / 100) + 5;

    const defBoostMult =
      defenderBoost >= 0
        ? (2 + defenderBoost) / 2
        : 2 / (2 - defenderBoost);
    defense = Math.floor(defense * defBoostMult);

    if (defenderItem === "assault_vest" && selectedMove.category === "special") {
      defense = Math.floor(defense * 1.5);
    }

    const maxHP = Math.floor(((2 * (defender?.stats?.hp || 50) + 31 + 63) * level) / 100) + 60;

    let baseDamage = Math.floor(
      Math.floor((Math.floor((2 * level) / 5 + 2) * selectedMove.bp * attack) / defense) / 50 + 2
    );

    if (weather === "sun") {
      if (selectedMove.type === "fire") baseDamage = Math.floor(baseDamage * 1.5);
      if (selectedMove.type === "water") baseDamage = Math.floor(baseDamage * 0.5);
    } else if (weather === "rain") {
      if (selectedMove.type === "water") baseDamage = Math.floor(baseDamage * 1.5);
      if (selectedMove.type === "fire") baseDamage = Math.floor(baseDamage * 0.5);
    }

    if (terrain === "electric" && selectedMove.type === "electric") baseDamage = Math.floor(baseDamage * 1.3);
    if (terrain === "grassy" && selectedMove.type === "grass") baseDamage = Math.floor(baseDamage * 1.3);
    if (terrain === "psychic" && selectedMove.type === "psychic") baseDamage = Math.floor(baseDamage * 1.3);

    const isSTAB = attacker?.types?.includes(selectedMove.type as any);
    if (isSTAB) baseDamage = Math.floor(baseDamage * 1.5);

    let typeMult = 1;
    const rules = TYPE_CHART[selectedMove.type];
    if (rules && defender?.types) {
      defender.types.forEach((defType) => {
        if (rules.immune.includes(defType)) typeMult *= 0;
        else if (rules.strong.includes(defType)) typeMult *= 2;
        else if (rules.weak.includes(defType)) typeMult *= 0.5;
      });
    }

    const rolls = Array.from({ length: 16 }, (_, i) => {
      const rollMult = (85 + i) / 100;
      return Math.max(1, Math.floor(Math.floor(baseDamage * rollMult) * typeMult));
    });

    const minDmg = rolls[0];
    const maxDmg = rolls[15];

    const minPercent = ((minDmg / maxHP) * 100).toFixed(1);
    const maxPercent = ((maxDmg / maxHP) * 100).toFixed(1);

    const isOHKO = minDmg >= maxHP;
    const canOHKO = maxDmg >= maxHP;
    const is2HKO = minDmg * 2 >= maxHP;

    let verdict = `${minPercent}% - ${maxPercent}%`;
    let koText = "3HKO o superior";
    if (isOHKO) koText = "¡Garantizado OHKO (1 solo golpe)!";
    else if (canOHKO) koText = "Posible OHKO según tirada de daño";
    else if (is2HKO) koText = "Garantizado 2HKO (derrota en 2 turnos)";

    return {
      minDmg,
      maxDmg,
      maxHP,
      minPercent: Number(minPercent),
      maxPercent: Number(maxPercent),
      verdict,
      koText,
      typeMult,
      isSTAB,
    };
  }, [
    attacker,
    defender,
    selectedMove,
    attackerBoost,
    defenderBoost,
    attackerItem,
    defenderItem,
    weather,
    terrain,
  ]);

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
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Calculadora de Daño & Breakpoints (Cobblemon)
                </h2>
                <p className="text-xs text-zinc-400">
                  Motor de combate oficial con clima de Minecraft, objetos competitivos y tiradas de daño
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

          {/* COMBATIENTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <PokemonPicker label="Atacante" selected={attacker} onSelect={(p) => setAttacker(p)} />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Objeto:</span>
                  <select
                    value={attackerItem}
                    onChange={(e) => setAttackerItem(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="none">Sin objeto</option>
                    <option value="life_orb">Vidasfera (+30%)</option>
                    <option value="choice">Elección (+50%)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Boost Ataque:</span>
                  <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-2 py-1">
                    <button
                      onClick={() => setAttackerBoost(Math.max(-6, attackerBoost - 1))}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      {attackerBoost > 0 ? `+${attackerBoost}` : attackerBoost}
                    </span>
                    <button
                      onClick={() => setAttackerBoost(Math.min(6, attackerBoost + 1))}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <PokemonPicker label="Defensor" selected={defender} onSelect={(p) => setDefender(p)} />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Objeto:</span>
                  <select
                    value={defenderItem}
                    onChange={(e) => setDefenderItem(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="none">Sin objeto</option>
                    <option value="assault_vest">Chaleco Asalto (+50% SpD)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Boost Defensa:</span>
                  <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-2 py-1">
                    <button
                      onClick={() => setDefenderBoost(Math.max(-6, defenderBoost - 1))}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-cyan-400 text-xs">
                      {defenderBoost > 0 ? `+${defenderBoost}` : defenderBoost}
                    </span>
                    <button
                      onClick={() => setDefenderBoost(Math.min(6, defenderBoost + 1))}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOVIMIENTOS HABITUALES */}
          <div className="mt-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Seleccionar Ataque de {attacker.name}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableMoves.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setSelectedMove(m)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedMove.name === m.name
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{m.name}</span>
                  <div className="flex justify-between items-center text-[10px] mt-1 text-zinc-500">
                    <span className="capitalize">{m.type}</span>
                    <span className="font-mono font-bold">{m.bp} BP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CLIMA Y TERRENO DE MINECRAFT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Clima de Minecraft:
              </span>
              <div className="flex gap-1 text-[11px] font-mono">
                {(["none", "sun", "rain"] as Weather[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`px-2 py-1 rounded-lg transition capitalize ${
                      weather === w
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {w === "none" ? "Despejado" : w === "sun" ? "Sol" : "Lluvia"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Terreno de Campo:
              </span>
              <div className="flex gap-1 text-[11px] font-mono">
                {(["none", "electric", "grassy"] as Terrain[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerrain(t)}
                    className={`px-2 py-1 rounded-lg transition capitalize ${
                      terrain === t
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t === "none" ? "Normal" : t === "electric" ? "Eléctrico" : "Hierba"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BARRA DE VIDA & VEREDICTO */}
          <div className="mt-5 p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  Daño Recibido por {defender.name}:
                </span>
                <span className="text-xs text-zinc-400">
                  {calculation.minDmg} - {calculation.maxDmg} PS de {calculation.maxHP} PS totales
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-rose-400">
                  {calculation.verdict}
                </span>
                <span className="text-[11px] block text-amber-300 font-semibold">
                  {calculation.koText}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-4 rounded-full bg-zinc-950 p-0.5 border border-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-rose-500/40 rounded-full absolute left-0 top-0 transition-all duration-300"
                  style={{ width: `${Math.min(100, calculation.maxPercent)}%` }}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    calculation.maxPercent >= 100
                      ? "bg-rose-500 animate-pulse"
                      : calculation.maxPercent >= 50
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, calculation.minPercent)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0% PS</span>
                <span>50% PS</span>
                <span>100% PS</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 text-[10px]">
              {calculation.isSTAB && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  STAB Activo (1.5x)
                </span>
              )}
              {calculation.typeMult > 1 && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Súper Eficaz ({calculation.typeMult}x)
                </span>
              )}
              {calculation.typeMult < 1 && calculation.typeMult > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  Poco Eficaz ({calculation.typeMult}x)
                </span>
              )}
              {calculation.typeMult === 0 && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 font-bold">
                  Inmune (0x)
                </span>
              )}
              {weather !== "none" && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold capitalize">
                  Clima: {weather}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
