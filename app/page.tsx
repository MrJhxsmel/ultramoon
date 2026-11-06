"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Users,
  Gauge,
  Swords,
  Egg,
  Compass,
  Crosshair,
  MapPin,
  ArrowUpRight,
  Box,
  Apple,
  Command,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
} from "lucide-react";
import { PokemonData } from "@/types/pokemon";
import { sounds } from "@/lib/sound-effects";
import { ToastContainer, ToastMessage } from "@/components/ui/toast";

// Modales de la suite
import { PastureSimulator } from "@/components/breeding/pasture-simulator";
import { TeamBuilderModal } from "@/components/team-builder/team-builder-modal";
import { PokemonComparator } from "@/components/pokemon/pokemon-comparator";
import { DamageCalculatorModal } from "@/components/pokemon/damage-calculator-modal";
import { EvTrackerModal } from "@/components/mechanics/ev-tracker-modal";
import { CaptureCalculatorModal } from "@/components/mechanics/capture-calculator-modal";
import { HabitatSearchModal } from "@/components/mechanics/habitat-search-modal";
import { EvolutionGuideModal } from "@/components/mechanics/evolution-guide-modal";
import { ApricornGuideModal } from "@/components/mechanics/apricorn-guide-modal";
import { PokemonDetailModal } from "@/components/pokemon/pokemon-detail-modal";
import { CommandMenu } from "@/components/ui/command-menu";

// Tarjeta con Tilt 3D Holográfico y Resplandor Reactivo
function TiltSpotlightCard({
  tool,
  index,
  isHudMode,
}: {
  tool: {
    title: string;
    desc: string;
    icon: any;
    badge: string;
    accentHex: string;
    action: () => void;
  };
  index: number;
  isHudMode: boolean;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Normalizado para inclinación (-0.5 a 0.5)
  const xPct = useMotionValue(0);
  const yPct = useMotionValue(0);

  // Filtro de resortes (spring) para movimiento fluido y orgánico
  const springConfig = { damping: 20, stiffness: 300, mass: 0.2 };
  const rotateXSpring = useSpring(useTransform(yPct, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateYSpring = useSpring(useTransform(xPct, [-0.5, 0.5], [-10, 10]), springConfig);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    mouseX.set(x);
    mouseY.set(y);
    xPct.set(x / width - 0.5);
    yPct.set(y / height - 0.5);
  }

  function handleMouseLeave() {
    xPct.set(0);
    yPct.set(0);
  }

  const Icon = tool.icon;

  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          sounds.playClick();
          tool.action();
        }}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: "preserve-3d",
          boxShadow: "0 10px 30px -8px rgba(0, 0, 0, 0.5)",
        }}
        whileTap={{ scale: 0.98 }}
        className={`group relative rounded-3xl border border-white/[0.08] bg-zinc-950/75 backdrop-blur-xl overflow-hidden cursor-pointer transition-colors duration-300 hover:border-white/20 ${
          isHudMode ? "p-4 h-36" : "p-6 h-52"
        }`}
      >
        {/* Halo de luz que persigue el cursor */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                320px circle at ${mouseX}px ${mouseY}px,
                ${tool.accentHex}28,
                transparent 80%
              )
            `,
          }}
        />

        {/* Resplandor superior sutil */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-60"
          style={{ backgroundColor: tool.accentHex }}
        />

        {/* Capa de contenido elevado en el eje Z */}
        <div
          className="relative z-10 flex h-full flex-col justify-between"
          style={{ transform: "translateZ(25px)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 bg-white/[0.03] transition-transform duration-300 group-hover:scale-110"
                style={{ boxShadow: `0 0 15px -4px ${tool.accentHex}50` }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">
                {tool.badge}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-zinc-100 transition font-['Space_Grotesk',sans-serif]">
              {tool.title}
            </h3>
            {!isHudMode && (
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed line-clamp-2 group-hover:text-zinc-300 transition-colors">
                {tool.desc}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] sm:text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <span>Abrir módulo</span>
            <div className="w-6 h-6 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [isPastureOpen, setIsPastureOpen] = useState(false);
  const [isTeamBuilderOpen, setIsTeamBuilderOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isDamageCalcOpen, setIsDamageCalcOpen] = useState(false);
  const [isEvTrackerOpen, setIsEvTrackerOpen] = useState(false);
  const [isCaptureCalcOpen, setIsCaptureCalcOpen] = useState(false);
  const [isHabitatSearchOpen, setIsHabitatSearchOpen] = useState(false);
  const [isEvolutionGuideOpen, setIsEvolutionGuideOpen] = useState(false);
  const [isApricornGuideOpen, setIsApricornGuideOpen] = useState(false);

  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [detailPokemon, setDetailPokemon] = useState<PokemonData | null>(null);
  const [combatantPokemon, setCombatantPokemon] = useState<PokemonData | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isHudMode, setIsHudMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const triggerToast = (title: string, description?: string) => {
    const id = "toast-" + Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);
    sounds.playSuccess();
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleToggleSound = () => {
    const newState = sounds.toggleMute();
    setIsMuted(newState);
    if (!newState) sounds.playClick();
  };

  const handleToggleHud = () => {
    sounds.playClick();
    setIsHudMode(!isHudMode);
    triggerToast(
      !isHudMode ? "Modo HUD Activado" : "Modo Normal Activado",
      !isHudMode
        ? "Vista compacta ideal para jugar con pantalla dividida."
        : "Vista extendida restaurada."
    );
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        sounds.playOpen();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleSelectToolFromMenu = (toolId: string) => {
    sounds.playClick();
    switch (toolId) {
      case "team-builder":
        setIsTeamBuilderOpen(true);
        break;
      case "damage-calc":
        setCombatantPokemon(null);
        setIsDamageCalcOpen(true);
        break;
      case "comparator":
        setCombatantPokemon(null);
        setIsComparatorOpen(true);
        break;
      case "pasture":
        setIsPastureOpen(true);
        break;
      case "ev-tracker":
        setIsEvTrackerOpen(true);
        break;
      case "capture-calc":
        setIsCaptureCalcOpen(true);
        break;
      case "habitats":
        setIsHabitatSearchOpen(true);
        break;
      case "evolutions":
        setIsEvolutionGuideOpen(true);
        break;
      case "apricorns":
        setIsApricornGuideOpen(true);
        break;
    }
  };

  const TOOLS = [
    {
      title: "Team Builder",
      desc: "Constructor 6v6 con persistencia local, exportación Showdown y comandos /pokegive.",
      icon: Users,
      badge: "6v6 VGC",
      accentHex: "#a855f7",
      action: () => setIsTeamBuilderOpen(true),
    },
    {
      title: "Calculadora de Daño",
      desc: "Simulador oficial con mecánicas Gen 9, clima de Minecraft, terrenos y tiradas de daño.",
      icon: Swords,
      badge: "Breakpoints",
      accentHex: "#f43f5e",
      action: () => {
        setCombatantPokemon(null);
        setIsDamageCalcOpen(true);
      },
    },
    {
      title: "Comparador 1 vs 1",
      desc: "Duelos analíticos directos, Speed Tiers, ventajas de tipos y comparativas de estadísticas.",
      icon: Gauge,
      badge: "Speed Tiers",
      accentHex: "#3b82f6",
      action: () => {
        setCombatantPokemon(null);
        setIsComparatorOpen(true);
      },
    },
    {
      title: "Pasture & Crianza",
      desc: "Simulador de bloques Pasture, compatibilidad de especies, radio cúbico e IVs heredados.",
      icon: Egg,
      badge: "Gen 9",
      accentHex: "#f59e0b",
      action: () => setIsPastureOpen(true),
    },
    {
      title: "Guía de Caza de EVs",
      desc: "Rutas óptimas en Minecraft por bioma, horario y altura Y para maximizar tus 252 EVs.",
      icon: Compass,
      badge: "Farmeo",
      accentHex: "#10b981",
      action: () => setIsEvTrackerOpen(true),
    },
    {
      title: "Calculadora de Captura",
      desc: "Fórmula matemática de captura Cobblemon según salud, estados alterados y Poké Balls.",
      icon: Crosshair,
      badge: "Catch Rate",
      accentHex: "#06b6d4",
      action: () => setIsCaptureCalcOpen(true),
    },
    {
      title: "Buscador de Hábitats",
      desc: "Explorador de spawns en tiempo real filtrado por biomas, bloques y condiciones climáticas.",
      icon: MapPin,
      badge: "Spawns",
      accentHex: "#14b8a6",
      action: () => setIsHabitatSearchOpen(true),
    },
    {
      title: "Evoluciones Especiales",
      desc: "Métodos adaptados a Minecraft: proximidad a bloques, Link Cable y umbral de Amistad.",
      icon: Box,
      badge: "Minecraft",
      accentHex: "#f97316",
      action: () => setIsEvolutionGuideOpen(true),
    },
    {
      title: "Apricorns & Bayas",
      desc: "Forja de Poké Balls en el yunque, bayas reductoras de EVs y optimización de cosechas.",
      icon: Apple,
      badge: "Crafteo",
      accentHex: "#84cc16",
      action: () => setIsApricornGuideOpen(true),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070709] text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden font-sans">
      {/* Cuadrícula Geométrica */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-purple-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-[35%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] -right-[10%] w-[550px] h-[550px] bg-amber-500/10 blur-[170px] rounded-full" />
      </div>

      <div
        className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isHudMode ? "py-4 space-y-4" : "py-10 space-y-12"
        }`}
      >
        {/* HEADER GLASSMORPHISM */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-zinc-950" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk',sans-serif] tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Ultramoon
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Cobblemon Suite
                </span>
              </div>
              {!isHudMode && (
                <p className="text-xs text-zinc-400">
                  Suite táctica y analítica competitiva para Minecraft
                </p>
              )}
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                sounds.playOpen();
                setIsCommandMenuOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition group"
            >
              <Command className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
              <span className="hidden sm:inline">Paleta</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-white/10 text-zinc-400">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={handleToggleHud}
              className={`p-2 rounded-2xl border transition ${
                isHudMode
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-400 hover:text-white"
              }`}
              title={isHudMode ? "Desactivar modo HUD" : "Activar modo HUD compacto"}
            >
              {isHudMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-2xl border transition ${
                !isMuted
                  ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
              title={isMuted ? "Activar efectos de sonido" : "Silenciar efectos de sonido"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* HERO BANNER */}
        {!isHudMode && (
          <section className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.01] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                <span>Módulos Tácticos Gen 9</span>
              </div>
              <h2 className="text-3xl font-extrabold font-['Space_Grotesk',sans-serif] tracking-tight text-white">
                Suite Competitiva para Cobblemon
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Cálculo de daño, crianza en Pasture Blocks, forja de Poké Balls y exportación de
                comandos <code className="text-zinc-200 font-mono">/pokegive</code>.
              </p>
            </div>
          </section>
        )}

        {/* PARRILLA DE HERRAMIENTAS CON TILT 3D */}
        <section
          className={`grid gap-4 ${
            isHudMode
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {TOOLS.map((tool, idx) => (
            <TiltSpotlightCard
              key={tool.title}
              tool={tool}
              index={idx}
              isHudMode={isHudMode}
            />
          ))}
        </section>

        {/* FOOTER */}
        {!isHudMode && (
          <footer className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Ultramoon Suite • Compatible con Minecraft & Cobblemon</span>
            </div>
            <span>Mecánicas oficiales Gen 9 Showdown & VGC</span>
          </footer>
        )}
      </div>

      {/* PALETA DE COMANDOS */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        onSelectTool={handleSelectToolFromMenu}
        onSelectPokemon={(p: PokemonData) => setDetailPokemon(p)}
      />

      {/* NOTIFICACIONES TOAST */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* MODALES MONTADOS */}
      <PastureSimulator
        isOpen={isPastureOpen}
        onClose={() => setIsPastureOpen(false)}
      />

      <TeamBuilderModal
        isOpen={isTeamBuilderOpen}
        onClose={() => setIsTeamBuilderOpen(false)}
      />

      <PokemonComparator
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        initialPokemon={combatantPokemon}
      />

      <DamageCalculatorModal
        isOpen={isDamageCalcOpen}
        onClose={() => setIsDamageCalcOpen(false)}
        initialPokemon={combatantPokemon}
      />

      <EvTrackerModal
        isOpen={isEvTrackerOpen}
        onClose={() => setIsEvTrackerOpen(false)}
      />

      <CaptureCalculatorModal
        isOpen={isCaptureCalcOpen}
        onClose={() => setIsCaptureCalcOpen(false)}
      />

      <HabitatSearchModal
        isOpen={isHabitatSearchOpen}
        onClose={() => setIsHabitatSearchOpen(false)}
      />

      <EvolutionGuideModal
        isOpen={isEvolutionGuideOpen}
        onClose={() => setIsEvolutionGuideOpen(false)}
      />

      <ApricornGuideModal
        isOpen={isApricornGuideOpen}
        onClose={() => setIsApricornGuideOpen(false)}
      />

      <PokemonDetailModal
        pokemon={detailPokemon}
        isOpen={!!detailPokemon}
        onClose={() => setDetailPokemon(null)}
        onOpenComparator={(p) => {
          setCombatantPokemon(p);
          setIsComparatorOpen(true);
        }}
        onOpenDamageCalc={(p) => {
          setCombatantPokemon(p);
          setIsDamageCalcOpen(true);
        }}
      />
    </div>
  );
}
