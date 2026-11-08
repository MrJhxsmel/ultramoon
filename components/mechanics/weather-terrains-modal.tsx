"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CloudRain,
  Sun,
  Wind,
  Snowflake,
  Zap,
  ShieldAlert,
  Search,
} from "lucide-react";

interface WeatherTerrainsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EnvironmentEffect {
  name: string;
  type: "weather" | "terrain";
  iconType: "rain" | "sun" | "sand" | "snow" | "electric" | "grassy" | "misty" | "psychic";
  boosts: string[];
  nerfs: string[];
  minecraftSynergy: string;
}

const ENV_EFFECTS: EnvironmentEffect[] = [
  {
    name: "Lluvia Intensa (Rain)",
    type: "weather",
    iconType: "rain",
    boosts: [
      "+50% daño a movimientos de Agua (Surf, Hidrobomba)",
      "Trueno (Thunder) y Vendaval (Hurricane) nunca fallan (100% precisión)",
      "Duplica velocidad con Nado Rápido (Swift Swim)",
    ],
    nerfs: [
      "-50% daño a movimientos de Fuego",
      "Rayo Solar requiere 2 turnos con potencia reducida",
    ],
    minecraftSynergy: "Se activa automáticamente durante tormentas de Minecraft o con la habilidad Llovizna (Drizzle).",
  },
  {
    name: "Sol Abrasador (Harsh Sunlight)",
    type: "weather",
    iconType: "sun",
    boosts: [
      "+50% daño a movimientos de Fuego (Llamarada, Envite Ígneo)",
      "Duplica velocidad con Clorofila (Chlorophyll)",
      "Rayo Solar se ejecuta en 1 solo turno de forma instantánea",
    ],
    nerfs: [
      "-50% daño a movimientos de Agua",
      "Trueno y Vendaval bajan su precisión al 50%",
    ],
    minecraftSynergy: "Común en biomas Badlands y Desiertos de Minecraft o con Sequía (Drought).",
  },
  {
    name: "Tormenta de Arena (Sandstorm)",
    type: "weather",
    iconType: "sand",
    boosts: [
      "+50% Defensa Especial a todos los Pokémon tipo Roca",
      "Duplica velocidad con Ímpetu Arena (Sand Rush)",
    ],
    nerfs: [
      "Daño residual del 6.25% cada turno a cualquier Pokémon que no sea Roca, Tierra o Acero",
    ],
    minecraftSynergy: "Generada por Chorro Arena (Tyranitar/Hippowdon) en biomas áridos.",
  },
  {
    name: "Nieve / Granizo (Snow)",
    type: "weather",
    iconType: "snow",
    boosts: [
      "+50% Defensa a todos los Pokémon tipo Hielo",
      "Ventisca (Blizzard) nunca falla (100% precisión)",
      "Duplica velocidad con Quitanieves (Slush Rush)",
    ],
    nerfs: [
      "No otorga daño residual directo en Gen 9, pero maximiza la resistencia física de muros helados",
    ],
    minecraftSynergy: "Activa de forma natural en picos helados y biomas nevados de Minecraft.",
  },
  {
    name: "Campo Eléctrico (Electric Terrain)",
    type: "terrain",
    iconType: "electric",
    boosts: [
      "+30% daño a movimientos de tipo Eléctrico sobre el suelo",
      "Activa habilidades Carga Cuark (Quark Drive / Paradox del Futuro)",
    ],
    nerfs: [
      "Inmunidad total al estado de Dormido (no funciona Espora ni Bostezo)",
    ],
    minecraftSynergy: "Afecta a entidades que toquen el suelo en Minecraft.",
  },
  {
    name: "Campo de Hierba (Grassy Terrain)",
    type: "terrain",
    iconType: "grassy",
    boosts: [
      "+30% daño a movimientos de tipo Planta",
      "Restaura 6.25% de HP cada turno a los Pokémon en tierra",
    ],
    nerfs: [
      "-50% de daño recibido por Terremoto (Earthquake) y Magnitud",
    ],
    minecraftSynergy: "Se complementa con bloques de césped y musgo en el pasto.",
  },
];

export function WeatherTerrainsModal({ isOpen, onClose }: WeatherTerrainsModalProps) {
  const [filter, setFilter] = useState<"all" | "weather" | "terrain">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = ENV_EFFECTS;
    if (filter !== "all") list = list.filter((e) => e.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.minecraftSynergy.toLowerCase().includes(q) ||
          e.boosts.some((b) => b.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filter, search]);

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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Climas & Terrenos de Minecraft</h2>
                <p className="text-xs text-zinc-400">
                  Interacciones competitivas de lluvia, sol, granizo y campos elementales sobre el mundo abierto
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === "all" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("weather")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === "weather" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Climas Atmosféricos
              </button>
              <button
                onClick={() => setFilter("terrain")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === "terrain" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Terrenos de Bloques
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar clima, efecto o habilidad..."
                className="w-full sm:w-60 bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.iconType === "rain" && <CloudRain className="w-4 h-4 text-cyan-400" />}
                      {item.iconType === "sun" && <Sun className="w-4 h-4 text-amber-400" />}
                      {item.iconType === "sand" && <Wind className="w-4 h-4 text-orange-400" />}
                      {item.iconType === "snow" && <Snowflake className="w-4 h-4 text-blue-200" />}
                      {item.iconType === "electric" && <Zap className="w-4 h-4 text-yellow-400" />}
                      {item.iconType === "grassy" && <Zap className="w-4 h-4 text-emerald-400" />}
                      <span>{item.name}</span>
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      {item.type === "weather" ? "Clima" : "Terreno"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Potenciadores:</span>
                      <ul className="space-y-1 text-zinc-300">
                        {item.boosts.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Penalizaciones:</span>
                      <ul className="space-y-1 text-zinc-300">
                        {item.nerfs.map((n, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                  <span className="text-cyan-300 font-semibold">Minecraft Cobblemon:</span> {item.minecraftSynergy}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
