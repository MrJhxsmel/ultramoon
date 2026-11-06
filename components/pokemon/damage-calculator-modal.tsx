"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Swords,
  Shield,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Zap,
  Sparkles,
  Search,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface DamageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const DEFAULT_ATTACKER = ALL_POKEMON.find((p) => p.name.toLowerCase() === "charizard") || ALL_POKEMON[0];
const DEFAULT_DEFENDER = ALL_POKEMON.find((p) => p.name.toLowerCase() === "venusaur") || ALL_POKEMON[1] || ALL_POKEMON[0];

const PRESET_MOVES = [
  { name: "Lanzallamas", type: "Fire", power: 90, category: "Special" },
  { name: "Envite Ígneo", type: "Fire", power: 120, category: "Physical" },
  { name: "Llamarada", type: "Fire", power: 110, category: "Special" },
  { name: "Terremoto", type: "Ground", power: 100, category: "Physical" },
  { name: "Hidrobomba", type: "Water", power: 110, category: "Special" },
  { name: "Rayo", type: "Electric", power: 90, category: "Special" },
  { name: "Rayo Hielo", type: "Ice", power: 90, category: "Special" },
  { name: "Pájaro Osado", type: "Flying", power: 120, category: "Physical" },
  { name: "A-Bocajarro", type: "Fighting", power: 120, category: "Physical" },
  { name: "Cometa Draco", type: "Dragon", power: 130, category: "Special" },
];

export function DamageCalculatorModal({
  isOpen,
  onClose,
}: DamageCalculatorModalProps) {
  const [attacker, setAttacker] = useState<PokemonData>(DEFAULT_ATTACKER);
  const [defender, setDefender] = useState<PokemonData>(DEFAULT_DEFENDER);

  const [atkBoost, setAtkBoost] = useState<number>(0);
  const [defBoost, setDefBoost] = useState<number>(0);

  // Climas y Terrenos completos
  const [weather, setWeather] = useState<"clear" | "sun" | "rain" | "snow" | "sand">("clear");
  const [terrain, setTerrain] = useState<"none" | "electric" | "grassy" | "psychic" | "misty">("none");

  // Pantallas Defensivas
  const [screens, setScreens] = useState({
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
  });

  // Movimiento actual o personalizado
  const [selectedMove, setSelectedMove] = useState(PRESET_MOVES[0]);
  const [customMoveName, setCustomMoveName] = useState("");
  const [customPower, setCustomPower] = useState<number>(90);

  // Cálculos de daño competitivos
  const calculationResult = useMemo(() => {
    const power = customPower || selectedMove.power;
    const isPhysical = selectedMove.category === "Physical";

    const atkStat = isPhysical ? attacker.stats.attack : attacker.stats.specialAttack;
    const defStat = isPhysical ? defender.stats.defense : defender.stats.specialDefense;

    // Modificadores de boost (-6 a +6)
    const getBoostMult = (stage: number) => (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage));
    const finalAtk = atkStat * getBoostMult(atkBoost);
    const finalDef = defStat * getBoostMult(defBoost);

    // Nivel 50 VGC base
    let baseDmg = Math.floor((((2 * 50) / 5 + 2) * power * (finalAtk / Math.max(1, finalDef))) / 50) + 2;

    // Clima
    if (weather === "sun") {
      if (selectedMove.type === "Fire") baseDmg = Math.floor(baseDmg * 1.5);
      if (selectedMove.type === "Water") baseDmg = Math.floor(baseDmg * 0.5);
    } else if (weather === "rain") {
      if (selectedMove.type === "Water") baseDmg = Math.floor(baseDmg * 1.5);
      if (selectedMove.type === "Fire") baseDmg = Math.floor(baseDmg * 0.5);
    }

    // Terrenos
    if (terrain === "electric" && selectedMove.type === "Electric") baseDmg = Math.floor(baseDmg * 1.3);
    if (terrain === "grassy" && selectedMove.type === "Grass") baseDmg = Math.floor(baseDmg * 1.3);
    if (terrain === "psychic" && selectedMove.type === "Psychic") baseDmg = Math.floor(baseDmg * 1.3);
    if (terrain === "misty" && selectedMove.type === "Dragon") baseDmg = Math.floor(baseDmg * 0.5);

    // Pantallas
    if (isPhysical && (screens.reflect || screens.auroraVeil)) {
      baseDmg = Math.floor(baseDmg * 0.5);
    }
    if (!isPhysical && (screens.lightScreen || screens.auroraVeil)) {
      baseDmg = Math.floor(baseDmg * 0.5);
    }

    // STAB
    const hasStab = attacker.types.map((t) => t.toLowerCase()).includes(selectedMove.type.toLowerCase());
    if (hasStab) {
      baseDmg = Math.floor(baseDmg * 1.5);
    }

    // Rolls (0.85 a 1.0)
    const minRoll = Math.floor(baseDmg * 0.85);
    const maxRoll = baseDmg;

    // HP Máximo defensivo Nv.50
    const defenderHp = Math.floor(((2 * defender.stats.hp + 31 + 252 / 4) * 50) / 100) + 50 + 10;
    const minPercent = ((minRoll / defenderHp) * 100).toFixed(1);
    const maxPercent = ((maxRoll / defenderHp) * 100).toFixed(1);

    return {
      minRoll,
      maxRoll,
      defenderHp,
      minPercent,
      maxPercent,
      ohkoChance: Number(minPercent) >= 100 ? "Garantizado OHKO (1 Golpe)" : Number(maxPercent) >= 100 ? "Probable OHKO" : "Garantizado 2HKO (derrota en 2 turnos)",
    };
  }, [attacker, defender, atkBoost, defBoost, weather, terrain, screens, selectedMove, customPower]);

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
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Calculadora de Daño Gen 9</h2>
                <p className="text-xs text-zinc-400">
                  Pantallas, climas de Minecraft, terrenos y selector libre de movimientos
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

          {/* Duelo Atacante vs Defensor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ATACANTE */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-rose-400">Atacante (Nv. 50)</span>
                <select
                  value={attacker.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setAttacker(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 80).map((p) => (
                    <option key={p.id + p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={attacker.sprite} alt={attacker.name} className="w-14 h-14 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-white">{attacker.name}</h4>
                  <div className="flex gap-1 mt-0.5">
                    {attacker.types.map((t) => (
                      <span key={t} className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">Boost Ataque:</span>
                <div className="flex items-center gap-1">
                  {[-2, -1, 0, 1, 2, 4].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setAtkBoost(stage)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        atkBoost === stage
                          ? "bg-rose-500 text-white"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {stage >= 0 ? `+${stage}` : stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DEFENSOR */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-cyan-400">Defensor (Nv. 50)</span>
                <select
                  value={defender.name}
                  onChange={(e) => {
                    const found = ALL_POKEMON.find((p) => p.name === e.target.value);
                    if (found) setDefender(found);
                  }}
                  className="bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  {ALL_POKEMON.slice(0, 80).map((p) => (
                    <option key={p.id + p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <img src={defender.sprite} alt={defender.name} className="w-14 h-14 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-white">{defender.name}</h4>
                  <div className="flex gap-1 mt-0.5">
                    {defender.types.map((t) => (
                      <span key={t} className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">Boost Defensa:</span>
                <div className="flex items-center gap-1">
                  {[-2, -1, 0, 1, 2, 4].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setDefBoost(stage)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        defBoost === stage
                          ? "bg-cyan-500 text-white"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {stage >= 0 ? `+${stage}` : stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Pantallas y Condiciones de Campo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            {/* Pantallas */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Pantallas del Defensor:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setScreens((s) => ({ ...s, reflect: !s.reflect }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    screens.reflect
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  Reflejo
                </button>
                <button
                  onClick={() => setScreens((s) => ({ ...s, lightScreen: !s.lightScreen }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    screens.lightScreen
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  Pantalla Luz
                </button>
                <button
                  onClick={() => setScreens((s) => ({ ...s, auroraVeil: !s.auroraVeil }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    screens.auroraVeil
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  Velo Aurora
                </button>
              </div>
            </div>

            {/* Climas */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Clima de Minecraft:
              </span>
              <div className="flex flex-wrap gap-1">
                {(["clear", "sun", "rain", "snow", "sand"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      weather === w ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {w === "clear" ? "Despejado" : w === "sun" ? "Sol" : w === "rain" ? "Lluvia" : w === "snow" ? "Nieve" : "Arena"}
                  </button>
                ))}
              </div>
            </div>

            {/* Terrenos */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Terrenos:
              </span>
              <div className="flex flex-wrap gap-1">
                {(["none", "electric", "grassy", "psychic", "misty"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerrain(t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      terrain === t ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t === "none" ? "Normal" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Movimientos & Personalización */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-zinc-400 block">
              Seleccionar o Personalizar Ataque:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_MOVES.map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    setSelectedMove(m);
                    setCustomPower(m.power);
                  }}
                  className={`p-2 rounded-xl text-left border transition ${
                    selectedMove.name === m.name
                      ? "bg-rose-500/20 border-rose-500/50 text-white"
                      : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{m.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Pot: {m.power} • {m.type}
                  </span>
                </button>
              ))}
            </div>

            {/* Potencia personalizada */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-zinc-400">Potencia de ataque personalizada:</span>
              <input
                type="number"
                value={customPower}
                onChange={(e) => setCustomPower(Number(e.target.value) || 0)}
                className="w-20 bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-400 text-center font-mono"
              />
            </div>
          </div>

          {/* Resultado del Cálculo */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-purple-950/20 to-zinc-900 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">
                  Daño Recibido por {defender.name}:
                </span>
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {calculationResult.minPercent}% - {calculationResult.maxPercent}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-mono">
                  {calculationResult.minRoll} - {calculationResult.maxRoll} PS
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {calculationResult.ohkoChance}
                </span>
              </div>
            </div>

            {/* Barra de Vida */}
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Number(calculationResult.maxPercent))}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
