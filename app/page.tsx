"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Terminal,
  TrendingUp,
  Wind,
  CloudRain,
} from "lucide-react";

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
import { ServerCommandsModal } from "@/components/mechanics/server-commands-modal";
import { ExpCalculatorModal } from "@/components/mechanics/exp-calculator-modal";
import { MountsFieldGuideModal } from "@/components/mechanics/mounts-field-guide-modal";
import { WeatherTerrainsModal } from "@/components/mechanics/weather-terrains-modal";

import type { PokemonData } from "@/types/pokemon";

const CURRENT_VERSION = "v2.1.0";

const CHANGELOG = [
  {
    version: "v2.1.0",
    date: "Última actualización",
    highlights: [
      "Climas & Terrenos de Minecraft: Guía de efectos de lluvia, sol, granizo y campos sobre movimientos y bloques.",
      "Calculadora de Captura Contextual: Ratios precisos según Ocaso Ball (cuevas Y<60), Malla Ball y Turno Ball.",
      "Team Builder & Matchups: Libreta de planes de juego guardada por equipo y exportador en Markdown para Discord.",
      "Formas Regionales & Monturas: Selector de Alola, Galar, Hisui y Paldea en PokéWiki y guía de vuelo/nado.",
    ],
  },
  {
    version: "v2.0.0",
    date: "Versión previa",
    highlights: [
      "Formas regionales en PokéWiki y asistente de cores en Team Builder.",
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
    badge: "REGIONALES",
    description: "Enciclopedia con formas de Alola, Galar, Hisui y Paldea, movimientos y habilidades.",
    icon: BookOpen,
    accent: "purple",
  },
  {
    id: "team-builder",
    title: "Team Builder & Matchups",
    badge: "6V6 + DISCORD",
    description: "Constructor 6v6, libreta de planes tácticos, cores meta FWG/DSF y exportación a Discord.",
    icon: Users,
    accent: "indigo",
  },
  {
    id: "weather-terrains",
    title: "Climas & Terrenos",
    badge: "MINECRAFT",
    description: "Efectos competitivos de lluvia, tormentas, sol abrasador y campos elementales sobre bloques.",
    icon: CloudRain,
    accent: "cyan",
  },
  {
    id: "mounts",
    title: "Monturas & Habilidades",
    badge: "SUPERVIVENCIA",
    description: "Guía de vuelo libre, nado rápido y aceleración de eclosión en Pasture (Cuerpo Llama).",
    icon: Wind,
    accent: "emerald",
  },
  {
    id: "catch-calc",
    title: "Calculadora de Captura",
    badge: "CONTEXTUAL",
    description: "Fórmula de captura considerando Ocaso Ball (Y<60), Malla Ball y turnos de combate.",
    icon: Crosshair,
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
    title: "Speed Tiers & Duelo 1v1",
    badge: "SPEED TIERS",
    description: "Duelos analíticos, cálculo de iniciativa a Nv. 50 con Scarf, Tailwind y Parálisis.",
    icon: Gauge,
    accent: "cyan",
  },
  {
    id: "server-commands",
    title: "Comandos de Servidor",
    badge: "ADMIN & GIVE",
    description: "Generador de comandos /pokegive, /pokespawn con IVs y /give de ítems competitivos.",
    icon: Terminal,
    accent: "purple",
  },
  {
    id: "exp-calc",
    title: "Calculadora de EXP",
    badge: "LEVEL UP",
    description: "Calcula la experiencia total y caramelos Cobblemon necesarios para alcanzar cualquier nivel.",
    icon: TrendingUp,
    accent: "amber",
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
    id: "habitats",
    title: "Buscador de Hábitats & Drops",
    badge: "SPAWNS & DROPS",
    description: "Localizador interactivo de Pokémon por biomas y buscador inverso de materiales de Minecraft.",
    icon: MapPin,
    accent: "cyan",
  },
  {
    id: "evolutions",
    title: "Evoluciones & Amistad",
    badge: "220 AMISTAD",
    description: "Calculadora de afecto y métodos especiales por bloques de Minecraft (Redstone, Hielo, Musgo).",
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

  const [volume, setVolume] = useState<number>(35);
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);

  useEffect(() => {
    const savedVol = localStorage.getItem("ultramoon_sound_volume");
    if (savedVol !== null) setVolume(Number(savedVol));

    const savedVersion = localStorage.getItem("ultramoon_seen_version");
    if (savedVersion !== CURRENT_VERSION) setShowUpdateToast(true);
  }, []);

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    localStorage.setItem("ultramoon_sound_volume", String(newVal));
  };

  const playPokemonCry = (pokemonId: number) => {
    if (volume === 0) return;
    try {
      const audio = new Audio(
        `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`
      );
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleOpenModule = (id: string) => {
    if (id === "pokewiki") {
      setIsSearchOpen(true);
      return;
    }
    setActiveModal(id);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-zinc-100 overflow-hidden font-sans">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Cabecera */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xl shadow-lg shadow-purple-500/30">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Ultramoon</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Cobblemon Suite
                </span>
                <button
                  onClick={() => setShowChangelogModal(true)}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                >
                  {CURRENT_VERSION}
                </button>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Suite táctica, climas, monturas y analítica competitiva para Minecraft
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 transition"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-zinc-300">⌘K</kbd>
            </button>

            {/* Selector de Volumen */}
            <div className="relative" ref={volumeRef}>
              <button
                onClick={() => setIsVolumePopoverOpen(!isVolumePopoverOpen)}
                className="p-2 rounded-xl border border-white/10 bg-zinc-800/80 text-zinc-300 flex items-center gap-1.5"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span className="text-[10px] font-mono font-bold">{volume}%</span>
              </button>

              {isVolumePopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl z-50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Volumen</span>
                    <span className="font-mono text-white">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Módulos */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const style = accentStyles[module.accent];

              return (
                <div
                  key={module.id}
                  onClick={() => handleOpenModule(module.id)}
                  className={`p-6 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 transition duration-300 cursor-pointer ${style.bgHover}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full border ${style.badge}`}>
                      {module.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{module.title}</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{module.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Instancias de Modales */}
      <TeamBuilderModal isOpen={activeModal === "team-builder"} onClose={() => setActiveModal(null)} />
      <DamageCalculatorModal isOpen={activeModal === "damage-calc"} onClose={() => setActiveModal(null)} />
      <PokemonComparator isOpen={activeModal === "speed-tiers"} onClose={() => setActiveModal(null)} />
      <WeatherTerrainsModal isOpen={activeModal === "weather-terrains"} onClose={() => setActiveModal(null)} />
      <ServerCommandsModal isOpen={activeModal === "server-commands"} onClose={() => setActiveModal(null)} />
      <ExpCalculatorModal isOpen={activeModal === "exp-calc"} onClose={() => setActiveModal(null)} />
      <MountsFieldGuideModal isOpen={activeModal === "mounts"} onClose={() => setActiveModal(null)} />
      <PastureSimulator isOpen={activeModal === "breeding"} onClose={() => setActiveModal(null)} />
      <EVTrackerModal isOpen={activeModal === "ev-hunting"} onClose={() => setActiveModal(null)} />
      <CaptureCalculatorModal isOpen={activeModal === "catch-calc"} onClose={() => setActiveModal(null)} />

      <HabitatSearchModal
        isOpen={activeModal === "habitats"}
        onClose={() => setActiveModal(null)}
        onSelectPokemon={(poke) => {
          setSelectedPokemon(poke);
          playPokemonCry(poke.id);
        }}
      />

      <EvolutionGuideModal isOpen={activeModal === "evolutions"} onClose={() => setActiveModal(null)} />
      <ApricornGuideModal isOpen={activeModal === "apricorns"} onClose={() => setActiveModal(null)} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPokemon={(pokemon: PokemonData) => {
          setSelectedPokemon(pokemon);
          playPokemonCry(pokemon.id);
          setIsSearchOpen(false);
        }}
      />

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
