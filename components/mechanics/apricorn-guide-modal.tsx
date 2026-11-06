"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Apple,
  Search,
  Hammer,
  Sparkles,
  Heart,
  TrendingDown,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface ApricornGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "balls" | "ev_berries" | "breeding";

interface BallCraftingData {
  name: string;
  topColor: string;
  apricornRecipe: string[];
  baseRequired: "Hierro" | "Cobre" | "Oro";
  bonusEffect: string;
  badgeColor: string;
}

interface EvBerryData {
  name: string;
  statReduced: string;
  friendshipBonus: string;
  biomes: string[];
  notes: string;
}

const BALL_CRAFTING_LIST: BallCraftingData[] = [
  {
    name: "Poké Ball",
    topColor: "Roja",
    apricornRecipe: ["Apricorn Roja", "Apricorn Roja", "Apricorn Roja"],
    baseRequired: "Cobre",
    bonusEffect: "Tasa base estándar (1.0x).",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    name: "Súper Ball (Great Ball)",
    topColor: "Azul / Roja",
    apricornRecipe: ["Apricorn Azul", "Apricorn Roja", "Apricorn Azul"],
    baseRequired: "Hierro",
    bonusEffect: "1.5x de efectividad estándar.",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    name: "Ultra Ball",
    topColor: "Negra / Amarilla",
    apricornRecipe: ["Apricorn Negra", "Apricorn Amarilla", "Apricorn Negra"],
    baseRequired: "Oro",
    bonusEffect: "2.0x de efectividad para capturas difíciles.",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    name: "Ocaso Ball (Dusk Ball)",
    topColor: "Verde / Negra",
    apricornRecipe: ["Apricorn Verde", "Apricorn Negra", "Apricorn Verde"],
    baseRequired: "Hierro",
    bonusEffect: "3.0x de noche o dentro de cuevas (Y < 60).",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    name: "Veloz Ball (Quick Ball)",
    topColor: "Azul / Amarilla",
    apricornRecipe: ["Apricorn Azul", "Apricorn Amarilla", "Apricorn Azul"],
    baseRequired: "Hierro",
    bonusEffect: "5.0x si se lanza en el primer turno de batalla.",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    name: "Turno Ball (Timer Ball)",
    topColor: "Blanca / Roja",
    apricornRecipe: ["Apricorn Blanca", "Apricorn Roja", "Apricorn Blanca"],
    baseRequired: "Hierro",
    bonusEffect: "Aumenta la tasa por cada turno transcurrido (hasta 4.0x).",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    name: "Cobble Ball",
    topColor: "Negra / Roja",
    apricornRecipe: ["Apricorn Negra", "Apricorn Roja", "Apricorn Negra"],
    baseRequired: "Hierro",
    bonusEffect: "Ball típica de Cobblemon (1.25x en biomas rocosos).",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
];

const EV_BERRIES_LIST: EvBerryData[] = [
  {
    name: "Baya Grana (Pomeg Berry)",
    statReduced: "-10 EVs en Puntos de Salud (PS)",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Pantanos", "Bosques Templados"],
    notes: "Indispensable para optimizar Pokémon atacantes frágiles o sweeps.",
  },
  {
    name: "Baya Algama (Kelpsy Berry)",
    statReduced: "-10 EVs en Ataque Físico",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Playas", "Costas", "Ríos"],
    notes: "Clave para builds de Ataque Especial que quieren minimizar daño de Juego Sucio.",
  },
  {
    name: "Baya Ispero (Qualot Berry)",
    statReduced: "-10 EVs en Defensa Física",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Llanuras", "Sabana"],
    notes: "Corrige defensas entrenadas por error contra Graveler o Geodude.",
  },
  {
    name: "Baya Meluce (Hondew Berry)",
    statReduced: "-10 EVs en Ataque Especial",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Bosques de Abedul", "Taiga"],
    notes: "Fundamental para atacantes puramente físicos.",
  },
  {
    name: "Baya Hilera (Grepa Berry)",
    statReduced: "-10 EVs en Defensa Especial",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Junglas", "Llanuras Florecidas"],
    notes: "Reasigna puntos hacia velocidad o ataque.",
  },
  {
    name: "Baya Tamate (Tamato Berry)",
    statReduced: "-10 EVs en Velocidad",
    friendshipBonus: "+10 Puntos de Amistad",
    biomes: ["Badlands (Mesa)", "Desierto"],
    notes: "Vital para equipos de Espacio Raro (Trick Room) que buscan 0 Spe.",
  },
];

export function ApricornGuideModal({ isOpen, onClose }: ApricornGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("balls");
  const [query, setQuery] = useState("");

  const filteredBalls = useMemo(() => {
    if (!query.trim()) return BALL_CRAFTING_LIST;
    const q = query.toLowerCase();
    return BALL_CRAFTING_LIST.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.topColor.toLowerCase().includes(q) ||
        b.baseRequired.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredBerries = useMemo(() => {
    if (!query.trim()) return EV_BERRIES_LIST;
    const q = query.toLowerCase();
    return EV_BERRIES_LIST.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.statReduced.toLowerCase().includes(q) ||
        b.biomes.some((bm) => bm.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

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
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                <Apple className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Guía de Apricorns & Bayas de Cobblemon
                </h2>
                <p className="text-xs text-zinc-400">
                  Recetas de forja en yunque, reducción de EVs y compatibilidad de cosechas
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

          {/* Navegación por pestañas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab("balls")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold ${
                  activeTab === "balls"
                    ? "bg-lime-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Forja de Poké Balls</span>
              </button>

              <button
                onClick={() => setActiveTab("ev_berries")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold ${
                  activeTab === "ev_berries"
                    ? "bg-lime-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Limpieza de EVs</span>
              </button>

              <button
                onClick={() => setActiveTab("breeding")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold ${
                  activeTab === "breeding"
                    ? "bg-lime-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Crianza & Pasture</span>
              </button>
            </div>

            {/* Buscador */}
            {activeTab !== "breeding" && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar por nombre o bioma..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            )}
          </div>

          {/* CONTENIDO PESTAÑA 1: FORJA DE POKÉ BALLS */}
          {activeTab === "balls" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 text-xs text-zinc-300">
                <Hammer className="w-4 h-4 text-lime-400 shrink-0" />
                <span>
                  <b>Regla de forja en Cobblemon:</b> Cocina 3 Apricorns en el horno para obtener las bayas horneadas, créalas en la mesa de crafteo para la <b>Tapa</b>, martíllala en el Yunque de Cobblemon junto a la <b>Base metálica</b> y el botón de piedra.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredBalls.map((ball) => (
                  <div
                    key={ball.name}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-lime-500/30 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">
                          {ball.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Tapa: <b className="text-zinc-200">{ball.topColor}</b>
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${ball.badgeColor}`}>
                        Base: {ball.baseRequired}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] text-zinc-300 font-mono">
                        {ball.apricornRecipe.join(" + ")}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {ball.bonusEffect}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENIDO PESTAÑA 2: LIMPIEZA DE EVS */}
          {activeTab === "ev_berries" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 text-xs text-zinc-300">
                <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Cada baya reduce <b>10 puntos de esfuerzo (EVs)</b> en la estadística indicada y sube la amistad con el Pokémon. Si asignaste EVs erróneos farmeando en Minecraft, dale estas bayas directamente.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredBerries.map((b) => (
                  <div
                    key={b.name}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-lime-500/30 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {b.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        {b.statReduced}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {b.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                      <span className="text-zinc-500 font-mono">
                        Biomas: <b className="text-zinc-300">{b.biomes.join(", ")}</b>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {b.friendshipBonus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENIDO PESTAÑA 3: CRIANZA & PASTURE */}
          {activeTab === "breeding" && (
            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Factores Agrícolas en el Pasture Block
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  En Cobblemon, los Pokémon situados en un Pasture Block evalúan un radio de <b>7 bloques cúbicos</b> a su alrededor. Si colocas los cultivos y bloques correctos, el medidor de compatibilidad alcanza los 3 corazones requeridos en menos de un tercio del tiempo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-400 block">Tipo Planta / Bicho:</span>
                    <span className="text-zinc-400">
                      Rodea el Pasture con <b>Arbustos de Bayas maduros</b>, Flores de pradera y Pacas de Heno. Aumenta +3 de valor por bloque.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="font-bold text-amber-400 block">Tipo Fuego / Dragón:</span>
                    <span className="text-zinc-400">
                      Coloca <b>Hogueras (Campfires)</b>, Bloques de Magma y Piedra del Nether a 3 bloques del nido.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="font-bold text-blue-400 block">Tipo Agua / Hielo:</span>
                    <span className="text-zinc-400">
                      Crea un estanque con <b>Hielo Compacto</b>, Agua infinita y Lirios de agua.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="font-bold text-purple-400 block">Tipo Fantasma / Siniestro:</span>
                    <span className="text-zinc-400">
                      Luz nivel 0, <b>Calabazas talladas (Jack o'Lanterns)</b> y bloques de Soul Soil o Soul Sand.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
