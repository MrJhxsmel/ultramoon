"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Swords,
  Gauge,
  Egg,
  Compass,
  Crosshair,
  MapPin,
  Sparkles,
  Apple,
  BookOpen,
  Search,
  Maximize2,
  Volume2,
  VolumeX,
  ExternalLink,
  Zap,
  Bell,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";

// Modales interactivos del proyecto
import { TeamBuilderModal } from "@/components/team-builder/team-builder-modal";
import { DamageCalculatorModal } from "@/components/pokemon/damage-calculator-modal";
import { PokemonComparator } from "@/components/pokemon/pokemon-comparator";
import { PastureSimulator } from "@/components/breeding/pasture-simulator";
import { EvTrackerModal as EVTrackerModal } from "@/components/mechanics/ev-tracker-modal";
import { CaptureCalculatorModal } from "@/components/mechanics/capture-calculator-modal";
import { HabitatSearchModal } from "@/components/mechanics/habitat-search-modal";
import { EvolutionGuideModal } from "@/components/mechanics/evolution-guide-modal";
import { ApricornGuideModal } from "@/components/mechanics/apricorn-guide-modal";
import { SearchModal } from "@/components/pokemon/search-modal";
import { PokemonDetailModal } from "@/components/pokemon/pokemon-detail-modal";

import type { PokemonData } from "@/types/pokemon";

// Versión del sistema
const CURRENT_VERSION = "v1.7.1";

const CHANGELOG = [
  {
    version: "v1.7.1",
    date: "Última actualización",
    highlights: [
      "Hábitats & Drops: Clic funcional en cualquier Pokémon para abrir directamente su ficha completa en la PokéWiki.",
      "Optimización de Rendimiento: Carga bajo demanda de sprites con lazy loading para reducir consumo de recursos.",
      "Buscador Inverso: Catálogo de drops con imágenes y previsualización de especies que sueltan cada material.",
      "Team Builder: Exportador visual a imagen PNG de alta resolución con cuadrícula 6v6 y badges elementales.",
    ],
  },
  {
    version: "v1.7.0",
    date: "Versión previa",
    highlights: [
      "Buscador Inverso de Drops de Minecraft y exportador PNG de equipos.",
      "Presets competitivos Smogon y simulación de herencia de IVs en vivo.",
    ],
  },
];

interface ToolModule {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  accent: "purple" | "emerald" | "amber" | "rose" | "cyan" | "indigo";
}

const modules: ToolModule[] = [
  {
    id: "pokewiki",
    title: "PokéWiki & Dex",
    badge: "DATABASE",
    description: "Enciclopedia Cobblemon: movimientos reales, habilidades ocultas, BST y drops auténticos.",
    icon: BookOpen,
    accent: "purple",
  },
  {
    id: "team-builder",
    title: "Team Builder",
    badge: "6V6 VGC",
    description: "Constructor con importador Showdown, enlace compartible, descarga en PNG y QR móvil.",
    icon: Users,
    accent: "indigo",
  },
  {
    id: "damage-calc",
    title: "Calculadora de Daño",
    badge: "BREAKPOINTS",
    description: "Buscador de especies, pantallas, climas de Minecraft, terrenos y tiradas de daño oficiales.",
    icon: Swords,
    accent: "rose",
  },
  {
    id: "speed-tiers",
    title: "Comparador 1 vs 1",
    badge: "SPEED TIERS",
    description: "Duelos analíticos directos, Speed Tiers, ventajas de tipos y comparativas de estadísticas.",
    icon: Gauge,
    accent: "cyan",
  },
  {
    id: "breeding",
    title: "Pasture & Crianza",
    badge: "GEN 9",
    description: "Simulador de bloques Pasture, compatibilidad de especies, radio cúbico y objetos recios.",
    icon: Egg,
    accent: "emerald",
  },
  {
    id: "ev-hunting",
    title: "Guía de Caza de EVs",
    badge: "FARMEO",
    description: "Rutas óptimas en Minecraft por bioma y calculadora exacta de Kills con objetos recios.",
    icon: Compass,
    accent: "amber",
  },
  {
    id: "catch-calc",
    title: "Calculadora de Captura",
    badge: "CATCH RATE",
    description: "Fórmula matemática de captura Cobblemon según salud, cuevas (Y < 60) y Poké Balls.",
    icon: Crosshair,
    accent: "indigo",
  },
  {
    id: "habitats",
    title: "Buscador de Hábitats",
    badge: "SPAWNS & DROPS",
    description: "Localizador interactivo de Pokémon por biomas y buscador inverso de drops de Minecraft.",
    icon: MapPin,
    accent: "cyan",
  },
  {
    id: "evolutions",
    title: "Evoluciones Especiales",
    badge: "MINECRAFT",
    description: "Métodos evolutivos adaptados a Cobblemon: niveles de amistad (220), bloques y objetos.",
    icon: Sparkles,
    accent: "purple",
  },
  {
    id: "apricorns",
    title: "Apricorns & Bayas",
    badge: "CRAFTEO",
    description: "Recetas visuales 3x3 de Poké Balls con sprites de referencia y bayas reductoras de EVs.",
    icon: Apple,
    accent: "rose",
  },
];

const accentStyles = {
  purple: {
    bgHover: "hover:border-purple-500/50 hover:shadow-purple-500/15",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    iconBg: "bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25",
  },
  rose: {
    bgHover: "hover:border-rose-500/50 hover:shadow-rose-500/15",
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25",
  },
  cyan: {
    bgHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/15",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    iconBg: "bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25",
  },
  emerald: {
    bgHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/15",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25",
  },
  amber: {
    bgHover: "hover:border-amber-500/50 hover:shadow-amber-500/15",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25",
  },
  indigo: {
    bgHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/15",
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    iconBg: "bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25",
  },
};

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("team")) {
        setActiveModal("team-builder");
      }
    }

    const savedVersion = localStorage.getItem("ultramoon_seen_version");
    if (savedVersion !== CURRENT_VERSION) {
      setShowUpdateToast(true);
    }
  }, []);

  const handleDismissToast = () => {
    setShowUpdateToast(false);
    localStorage.setItem("ultramoon_seen_version", CURRENT_VERSION);
  };

  const handleOpenChangelog = () => {
    setShowChangelogModal(true);
    handleDismissToast();
  };

  const handleForceHardReload = () => {
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    localStorage.setItem("ultramoon_seen_version", CURRENT_VERSION);
    window.location.reload();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenModule = (id: string) => {
    if (id === "pokewiki") {
      setIsSearchOpen(true);
      return;
    }
    setActiveModal(id);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-zinc-100 overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Luces de ambiente vivas */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-purple-600/25 via-indigo-600/15 to-transparent blur-3xl opacity-80" />
      <div className="pointer-events-none absolute top-1/3 -right-60 w-[550px] h-[550px] bg-cyan-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -left-60 w-[550px] h-[550px] bg-rose-500/10 blur-[130px] rounded-full" />

      {/* Cuadrícula sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Cabecera / Navegación */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/30 text-white font-black text-xl">
              <span>✦</span>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-zinc-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Ultramoon
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Cobblemon Suite
                </span>
                <button
                  onClick={() => setShowChangelogModal(true)}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                  title="Ver notas de la versión"
                >
                  {CURRENT_VERSION}
                </button>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Suite táctica y analítica competitiva para Minecraft
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Buscador ⌘K */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all shadow-sm"
              title="Abrir buscador rápido"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline font-medium">Buscar</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white/10 rounded text-zinc-300 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Alternar sonido */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all"
              title={soundEnabled ? "Silenciar audio" : "Activar audio"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Pantalla completa */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all hidden sm:flex"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Principal */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl shadow-purple-950/20">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Módulos Tácticos Gen 9</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Suite Competitiva <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                para Cobblemon
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed">
              Cálculo de daño oficial, coberturas defensivas de 18 tipos, enlaces compartibles de equipos, forja 3x3 de Poké Balls y exportación de comandos <code className="px-1.5 py-0.5 rounded bg-white/10 text-purple-200 font-mono text-xs">/pokegive</code>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorar PokéWiki</span>
              </button>
              <button
                onClick={() => setActiveModal("team-builder")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Team Builder</span>
              </button>
              <button
                onClick={() => setActiveModal("damage-calc")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Swords className="w-4 h-4 text-rose-400" />
                <span>Calculadora de Daño</span>
              </button>
            </div>
          </div>
        </section>

        {/* Grilla de Herramientas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Herramientas, Enciclopedia y Simuladores
            </h3>
            <span className="text-xs text-zinc-400">10 módulos disponibles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {modules.map((module) => {
              const Icon = module.icon;
              const style = accentStyles[module.accent];

              return (
                <div
                  key={module.id}
                  onClick={() => handleOpenModule(module.id)}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl cursor-pointer ${style.bgHover}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl transition-colors duration-300 ${style.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-full border ${style.badge}`}>
                        {module.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                        {module.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <span>{module.id === "pokewiki" ? "Abrir enciclopedia" : "Abrir módulo"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>Ultramoon Cobblemon Competitive Suite · Gen 9 Mechanics · PWA Ready</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChangelogModal(true)}
              className="hover:text-purple-300 transition underline underline-offset-4"
            >
              Registro de Cambios ({CURRENT_VERSION})
            </button>
            <span>•</span>
            <button
              onClick={handleForceHardReload}
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition font-medium"
              title="Borrar caché de la app y recargar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Forzar actualización limpia</span>
            </button>
          </div>
        </footer>
      </div>

      {/* GLOBO FLOTANTE DE NOTIFICACIÓN DE ACTUALIZACIÓN */}
      {showUpdateToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-zinc-900/95 border border-purple-500/40 p-4 shadow-2xl shadow-purple-950/60 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  ¡Actualización {CURRENT_VERSION}!
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Clic interactivo en hábitats para abrir la PokéWiki y optimización de carga de imágenes.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissToast}
              className="p-1 rounded-lg text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <button
              onClick={handleOpenChangelog}
              className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/30"
            >
              Ver Novedades
            </button>
            <button
              onClick={handleForceHardReload}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs border border-white/10 transition flex items-center gap-1"
              title="Vaciar caché y recargar"
            >
              <RefreshCw className="w-3 h-3 text-purple-400" />
              <span>Limpiar Caché</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE NOVEDADES */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Historial de Novedades</h3>
                  <span className="text-xs text-zinc-400">Últimas adiciones a Ultramoon Suite</span>
                </div>
              </div>
              <button
                onClick={() => setShowChangelogModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {CHANGELOG.map((log) => (
                <div key={log.version} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {log.version}
                    </span>
                    <span className="text-[11px] text-zinc-500">{log.date}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {log.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/10">
              <button
                onClick={handleForceHardReload}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>¿No ves los cambios? Forzar recarga</span>
              </button>
              <button
                onClick={() => setShowChangelogModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instancias de los Modales */}
      <TeamBuilderModal isOpen={activeModal === "team-builder"} onClose={() => setActiveModal(null)} />
      <DamageCalculatorModal isOpen={activeModal === "damage-calc"} onClose={() => setActiveModal(null)} />
      <PokemonComparator isOpen={activeModal === "speed-tiers"} onClose={() => setActiveModal(null)} />
      <PastureSimulator isOpen={activeModal === "breeding"} onClose={() => setActiveModal(null)} />
      <EVTrackerModal isOpen={activeModal === "ev-hunting"} onClose={() => setActiveModal(null)} />
      <CaptureCalculatorModal isOpen={activeModal === "catch-calc"} onClose={() => setActiveModal(null)} />

      {/* Conexión directa del prop onSelectPokemon para abrir la PokéWiki */}
      <HabitatSearchModal
        isOpen={activeModal === "habitats"}
        onClose={() => setActiveModal(null)}
        onSelectPokemon={(poke) => {
          setSelectedPokemon(poke);
        }}
      />

      <EvolutionGuideModal isOpen={activeModal === "evolutions"} onClose={() => setActiveModal(null)} />
      <ApricornGuideModal isOpen={activeModal === "apricorns"} onClose={() => setActiveModal(null)} />

      {/* Buscador Global ⌘K */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPokemon={(pokemon: PokemonData) => {
          setSelectedPokemon(pokemon);
          setIsSearchOpen(false);
        }}
      />

      {/* Ficha PokéWiki con GIFs y Shiny Toggle */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          isOpen={Boolean(selectedPokemon)}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}
