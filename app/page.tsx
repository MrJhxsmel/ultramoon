"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Volume2,
  VolumeX,
  RefreshCw,
  Terminal,
  TrendingUp,
  Wind,
  CloudRain,
  Palette,
  ArrowUpRight,
  User,
  LogOut,
  Lock,
  Cloud,
  Crown,
  Shield,
  Eye,
  EyeOff,
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
import { AuthModal } from "@/components/auth/auth-modal";
import { ProfileModal } from "@/components/profile/profile-modal";
import { ExportCommandsModal } from "@/components/team-builder/export-commands-modal";
import { EvTrackerCloudModal } from "@/components/mechanics/ev-tracker-cloud-modal";
import { SubscriptionModal } from "@/components/subscription/subscription-modal";
import { AdminDashboardModal } from "@/components/admin/admin-dashboard-modal";
import { VipWelcomeModal } from "@/components/subscription/vip-welcome-modal";
import { VipToastAlert } from "@/components/subscription/vip-toast-alert";
import { supabase } from "@/lib/supabase";

import type { PokemonData } from "@/types/pokemon";

const CURRENT_VERSION = "v2.2.0";

type ThemeMode = "midnight" | "slate" | "quartz" | "emerald";

interface ThemeConfig {
  id: ThemeMode;
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  glow: string;
}

const THEMES: Record<ThemeMode, ThemeConfig> = {
  midnight: {
    id: "midnight",
    name: "Midnight Void",
    bg: "bg-[#07090e]",
    text: "text-zinc-100",
    cardBg: "bg-zinc-900/40 hover:bg-zinc-900/70",
    cardBorder: "border-white/10 hover:border-purple-500/50",
    accent: "from-purple-600 to-indigo-600",
    glow: "rgba(147, 51, 234, 0.15)",
  },
  slate: {
    id: "slate",
    name: "Cyber Slate",
    bg: "bg-[#0b1120]",
    text: "text-slate-100",
    cardBg: "bg-slate-900/50 hover:bg-slate-900/80",
    cardBorder: "border-cyan-500/20 hover:border-cyan-400/50",
    accent: "from-cyan-500 to-blue-600",
    glow: "rgba(6, 182, 212, 0.15)",
  },
  quartz: {
    id: "quartz",
    name: "Nether Quartz (Claro)",
    bg: "bg-[#f4f6fb]",
    text: "text-slate-900",
    cardBg: "bg-white/80 hover:bg-white shadow-sm hover:shadow-xl",
    cardBorder: "border-slate-200 hover:border-purple-500/50",
    accent: "from-purple-600 to-indigo-600",
    glow: "rgba(99, 102, 241, 0.08)",
  },
  emerald: {
    id: "emerald",
    name: "Taiga Emerald",
    bg: "bg-[#05130e]",
    text: "text-emerald-50",
    cardBg: "bg-[#0a231b]/40 hover:bg-[#0a231b]/80",
    cardBorder: "border-emerald-500/20 hover:border-emerald-400/50",
    accent: "from-emerald-500 to-teal-600",
    glow: "rgba(16, 185, 129, 0.15)",
  },
};

interface ToolModule {
  id: string;
  flagKey?: string;
  title: string;
  category: "competitive" | "minecraft" | "breeding";
  badge: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  isNew?: boolean;
}

const MODULES: ToolModule[] = [
  {
    id: "pokewiki",
    title: "PokéWiki & Dex",
    category: "competitive",
    badge: "REGIONALES",
    description: "Enciclopedia con variantes de Alola, Galar, Hisui y Paldea, BST, movimientos y habilidades.",
    icon: BookOpen,
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    shadowColor: "group-hover:shadow-purple-500/20",
  },
  {
    id: "team-builder",
    flagKey: "cloud_team_builder",
    title: "Team Builder & Matchups",
    category: "competitive",
    badge: "6V6 + CLOUD",
    description: "Tablero interactivo, descarga de tarjeta en PNG, cores FWG/DSF y planes contra arquetipos meta.",
    icon: Users,
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
    shadowColor: "group-hover:shadow-indigo-500/20",
  },
  {
    id: "damage-calc",
    flagKey: "damage_calc",
    title: "Calculadora de Daño",
    category: "competitive",
    badge: "BREAKPOINTS",
    description: "Buscador de especies, pantallas, climas de Minecraft, terrenos y tiradas de daño oficiales.",
    icon: Swords,
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    shadowColor: "group-hover:shadow-rose-500/20",
  },
  {
    id: "speed-tiers",
    flagKey: "speed_tiers",
    title: "Speed Tiers & Duelo 1v1",
    category: "competitive",
    badge: "SPEED TIERS",
    description: "Duelos analíticos, cálculo de iniciativa a Nv. 50 con Scarf, Tailwind y Parálisis.",
    icon: Gauge,
    gradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
    shadowColor: "group-hover:shadow-cyan-500/20",
  },
  {
    id: "ev-hunting",
    flagKey: "cloud_ev_tracker",
    title: "Caza de EVs en la Nube",
    category: "breeding",
    badge: "CLOUD SYNC",
    description: "Rutas óptimas en Minecraft y rastreador de EVs persistente guardado en Supabase.",
    icon: Compass,
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    shadowColor: "group-hover:shadow-yellow-500/20",
    isNew: true,
  },
  {
    id: "export-commands",
    flagKey: "export_commands",
    title: "Generador de Comandos Cobblemon",
    category: "minecraft",
    badge: "/POKEGIVE PRO",
    description: "Exporta tus alineaciones a comandos oficiales de Minecraft con IVs, EVs, ataques y objetos.",
    icon: Terminal,
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
    shadowColor: "group-hover:shadow-fuchsia-500/20",
    isNew: true,
  },
  {
    id: "weather-terrains",
    flagKey: "weather_terrains",
    title: "Climas & Terrenos",
    category: "minecraft",
    badge: "MINECRAFT",
    description: "Efectos competitivos de lluvia, tormentas, sol abrasador y campos elementales sobre bloques.",
    icon: CloudRain,
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    shadowColor: "group-hover:shadow-blue-500/20",
  },
  {
    id: "mounts",
    flagKey: "mounts_guide",
    title: "Monturas & Habilidades",
    category: "minecraft",
    badge: "SUPERVIVENCIA",
    description: "Guía de vuelo libre, nado rápido y aceleración de eclosión en Pasture (Cuerpo Llama).",
    icon: Wind,
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    shadowColor: "group-hover:shadow-emerald-500/20",
  },
  {
    id: "catch-calc",
    flagKey: "catch_calc",
    title: "Calculadora de Captura",
    category: "minecraft",
    badge: "CONTEXTUAL",
    description: "Fórmula de captura considerando Ocaso Ball (Y<60), Malla Ball y turnos de combate.",
    icon: Crosshair,
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    shadowColor: "group-hover:shadow-violet-500/20",
  },
  {
    id: "server-commands",
    flagKey: "server_commands",
    title: "Comandos de Servidor",
    category: "minecraft",
    badge: "ADMIN & GIVE",
    description: "Generador de comandos /pokegive, /pokespawn con IVs y /give de ítems competitivos.",
    icon: Terminal,
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
    shadowColor: "group-hover:shadow-fuchsia-500/20",
  },
  {
    id: "exp-calc",
    flagKey: "exp_calc",
    title: "Calculadora de EXP",
    category: "breeding",
    badge: "LEVEL UP",
    description: "Calcula la experiencia total y caramelos Cobblemon necesarios para alcanzar cualquier nivel.",
    icon: TrendingUp,
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    shadowColor: "group-hover:shadow-amber-500/20",
  },
  {
    id: "breeding",
    flagKey: "pasture_simulator",
    title: "Pasture & Crianza",
    category: "breeding",
    badge: "GEN 9",
    description: "Simulador de bloques Pasture, compatibilidad de especies, radio cúbico y objetos recios.",
    icon: Egg,
    gradient: "from-lime-500/20 via-emerald-500/10 to-transparent",
    shadowColor: "group-hover:shadow-lime-500/20",
  },
  {
    id: "habitats",
    flagKey: "habitats_guide",
    title: "Buscador de Hábitats & Drops",
    category: "minecraft",
    badge: "SPAWNS & DROPS",
    description: "Localizador interactivo de Pokémon por biomas y buscador inverso de materiales de Minecraft.",
    icon: MapPin,
    gradient: "from-teal-500/20 via-cyan-500/10 to-transparent",
    shadowColor: "group-hover:shadow-teal-500/20",
  },
  {
    id: "evolutions",
    flagKey: "evolutions_guide",
    title: "Evoluciones & Amistad",
    category: "breeding",
    badge: "220 AMISTAD",
    description: "Calculadora de afecto y métodos especiales por bloques de Minecraft (Redstone, Hielo, Musgo).",
    icon: Sparkles,
    gradient: "from-pink-500/20 via-purple-500/10 to-transparent",
    shadowColor: "group-hover:shadow-pink-500/20",
  },
  {
    id: "apricorns",
    flagKey: "apricorns_guide",
    title: "Apricorns & Bayas",
    category: "breeding",
    badge: "CRAFTEO",
    description: "Recetas visuales 3x3 de Poké Balls con sprites de referencia y bayas reductoras de EVs.",
    icon: Apple,
    gradient: "from-red-500/20 via-orange-500/10 to-transparent",
    shadowColor: "group-hover:shadow-red-500/20",
  },
];

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandsModalOpen, setIsCommandsModalOpen] = useState(false);
  const [isEvCloudModalOpen, setIsEvCloudModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isWelcomeVipOpen, setIsWelcomeVipOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);

  const [toastAlert, setToastAlert] = useState<{
    open: boolean;
    title: string;
    desc: string;
    type: "vip_granted" | "feature_locked";
  }>({ open: false, title: "", desc: "", type: "vip_granted" });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [simulateFreeUser, setSimulateFreeUser] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("midnight");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "competitive" | "minecraft" | "breeding">("all");

  const [volume, setVolume] = useState<number>(35);
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const [isFeaturedShiny, setIsFeaturedShiny] = useState(false);
  const featuredPokemon = {
    name: "Garchomp",
    types: ["Dragon", "Ground"],
    tier: "OU Meta",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png",
    shinySprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/445.png",
    fallbackSprite: "https://play.pokemonshowdown.com/sprites/dex/garchomp.png",
    id: 445,
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setUserProfile(data);
        if (data.preferred_theme && THEMES[data.preferred_theme as ThemeMode]) {
          setCurrentTheme(data.preferred_theme as ThemeMode);
        }
        if (data.sound_volume !== undefined && data.sound_volume !== null) {
          setVolume(data.sound_volume);
        }
      }
    } catch (e) {}
  };

  const loadFeatureFlags = async () => {
    try {
      const { data } = await supabase.from("feature_flags").select("*");
      if (data) {
        const flags: Record<string, boolean> = {};
        data.forEach((f) => {
          flags[f.id] = f.is_premium;
        });
        setFeatureFlags(flags);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("ultramoon_theme") as ThemeMode | null;
    if (savedTheme && THEMES[savedTheme]) setCurrentTheme(savedTheme);

    const savedVol = localStorage.getItem("ultramoon_sound_volume");
    if (savedVol !== null) setVolume(Number(savedVol));

    loadFeatureFlags();

    let profilesChannel: any = null;
    let flagsChannel: any = null;

    // Escucha permanente de switches de módulos en vivo
    flagsChannel = supabase
      .channel("flags_realtime_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feature_flags" },
        (payload: any) => {
          if (payload.new && payload.new.id) {
            setFeatureFlags((prev) => ({
              ...prev,
              [payload.new.id]: payload.new.is_premium,
            }));
          }
        }
      )
      .subscribe();

    // Sincronización continua de perfil sin filtros restrictivos de SQL
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          await loadUserProfile(user.id);

          if (profilesChannel) supabase.removeChannel(profilesChannel);

          profilesChannel = supabase
            .channel("global_user_profiles_channel")
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "user_profiles",
              },
              (payload: any) => {
                // Filtrar por ID del usuario activo directamente en la aplicación
                if (payload.new && payload.new.id === user.id) {
                  setUserProfile((prev: any) => {
                    const prevStatus = prev?.subscription_status;
                    const nextStatus = payload.new.subscription_status;

                    if (nextStatus === "vip" && prevStatus !== "vip") {
                      setToastAlert({
                        open: true,
                        title: "¡Has sido ascendido a VIP!",
                        desc: "Acceso total activado en este momento.",
                        type: "vip_granted",
                      });
                      setIsWelcomeVipOpen(true);
                    }

                    if (nextStatus === "free" && prevStatus === "vip") {
                      setToastAlert({
                        open: true,
                        title: "Membresía Finalizada",
                        desc: "Tu suscripción ha cambiado a gratuita.",
                        type: "feature_locked",
                      });
                      setActiveModal(null);
                      setIsCommandsModalOpen(false);
                      setIsEvCloudModalOpen(false);
                    }

                    return payload.new;
                  });
                }
              }
            )
            .subscribe();
        } else {
          setUserProfile(null);
          if (profilesChannel) supabase.removeChannel(profilesChannel);
        }
      }
    );

    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setIsVolumePopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setActiveModal("team-builder");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setActiveModal("damage-calc");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      authListener?.subscription.unsubscribe();
      if (flagsChannel) supabase.removeChannel(flagsChannel);
      if (profilesChannel) supabase.removeChannel(profilesChannel);
    };
  }, []);

  const handleSelectTheme = async (theme: ThemeMode) => {
    setCurrentTheme(theme);
    localStorage.setItem("ultramoon_theme", theme);
    setIsThemeMenuOpen(false);

    if (currentUser) {
      await supabase.from("user_profiles").upsert(
        {
          id: currentUser.id,
          preferred_theme: theme,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }
  };

  const handleVolumeChange = async (newVal: number) => {
    setVolume(newVal);
    localStorage.setItem("ultramoon_sound_volume", String(newVal));

    if (currentUser) {
      await supabase.from("user_profiles").upsert(
        {
          id: currentUser.id,
          sound_volume: newVal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const isAdmin = useMemo(() => {
    if (userProfile?.role === "admin") return true;
    if (currentUser?.email?.toLowerCase() === "mrjhxsmel@gmail.com") return true;
    return false;
  }, [userProfile?.role, currentUser?.email]);

  const isVipUser = useMemo(() => {
    if (simulateFreeUser) return false;
    if (isAdmin) return true;
    if (userProfile?.subscription_status === "vip") return true;
    return false;
  }, [userProfile?.subscription_status, isAdmin, simulateFreeUser]);

  const isModuleLocked = (module: ToolModule) => {
    if (!module.flagKey) return false;
    const isPremium = Boolean(featureFlags[module.flagKey]);
    if (!isPremium) return false;
    return !isVipUser;
  };

  const handleModuleClick = (module: ToolModule) => {
    if (module.id === "pokewiki") {
      setIsSearchOpen(true);
      return;
    }

    if (isModuleLocked(module)) {
      if (!currentUser) {
        setIsAuthOpen(true);
      } else {
        setIsSubModalOpen(true);
      }
      return;
    }

    if (module.id === "ev-hunting") {
      if (!currentUser) setIsAuthOpen(true);
      else setIsEvCloudModalOpen(true);
      return;
    }

    if (module.id === "export-commands") {
      if (!currentUser) setIsAuthOpen(true);
      else setIsCommandsModalOpen(true);
      return;
    }

    setActiveModal(module.id);
  };

  const filteredModules = useMemo(() => {
    if (activeCategory === "all") return MODULES;
    return MODULES.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const currentThemeConfig = THEMES[currentTheme];
  const isLight = currentTheme === "quartz";

  const displayName =
    userProfile?.trainer_name ||
    userProfile?.minecraft_username ||
    currentUser?.email?.split("@")[0] ||
    "Entrenador";

  const mcSkinAvatar = userProfile?.minecraft_username
    ? `https://minotar.net/helm/${encodeURIComponent(userProfile.minecraft_username)}/24.png`
    : null;

  return (
    <div className={`relative min-h-screen ${currentThemeConfig.bg} ${currentThemeConfig.text} font-sans transition-colors duration-500 overflow-x-hidden selection:bg-purple-500/30 selection:text-white`}>
      <div
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] blur-[140px] rounded-full opacity-60 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${currentThemeConfig.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Cabecera Principal */}
        <header
          className={`flex items-center justify-between p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-2xl border transition-all duration-300 relative z-30 gap-1.5 sm:gap-3 ${
            isLight
              ? "bg-white/80 border-slate-200/80 shadow-lg shadow-slate-200/50"
              : "bg-zinc-950/70 border-white/10 shadow-2xl shadow-black/40"
          }`}
        >
          {/* Logo y Nombre */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              className={`flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${currentThemeConfig.accent} text-white font-black text-sm sm:text-xl shadow-lg shadow-purple-500/25 shrink-0`}
            >
              ✦
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-xl font-black tracking-tight leading-none">
                  Ultramoon
                </h1>
                <span className="text-[9px] font-mono opacity-50 hidden md:inline">
                  {CURRENT_VERSION}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden lg:block">
                Cobblemon Competitive Suite
              </p>
            </div>
          </div>

          {/* Botones Derecha */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white"
              }`}
              title="Buscar Pokémon (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buscar</span>
              <kbd className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 font-mono hidden md:inline">
                ⌘K
              </kbd>
            </button>

            {/* BOTÓN OWNER */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-black flex items-center gap-1 transition shrink-0"
                  title="Abrir Dashboard de Administrador"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Owner</span>
                </button>
                <button
                  onClick={() => setSimulateFreeUser(!simulateFreeUser)}
                  className={`p-1.5 rounded-xl sm:rounded-2xl border transition ${
                    simulateFreeUser
                      ? "bg-amber-400 text-black border-amber-300 font-bold"
                      : "bg-zinc-800/80 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                  title={
                    simulateFreeUser
                      ? "Modo Invitado activo (viendo la web como usuario gratis)"
                      : "Ver la web como usuario gratis"
                  }
                >
                  {simulateFreeUser ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            )}

            <button
              onClick={() => setIsSubModalOpen(true)}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border text-xs font-black flex items-center gap-1 transition shrink-0 ${
                isVipUser
                  ? "bg-amber-400/20 border-amber-400/40 text-amber-300 shadow-md shadow-amber-400/20"
                  : "bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30 text-amber-300"
              }`}
              title="Membresía VIP"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold">
                {isVipUser ? "VIP" : "VIP"}
              </span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border flex items-center gap-1.5 text-xs font-semibold transition ${
                    isLight
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-purple-500/15 border-purple-500/30 text-purple-300"
                  }`}
                  title="Ficha y Ajustes de Perfil"
                >
                  {mcSkinAvatar ? (
                    <img
                      src={mcSkinAvatar}
                      alt="Skin avatar"
                      className="w-4 h-4 rounded-md object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline text-xs">
                    {displayName}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-xl sm:rounded-2xl border transition ${
                    isLight
                      ? "bg-slate-100 hover:bg-rose-50 border-slate-200 text-slate-600 hover:text-rose-600"
                      : "bg-white/5 hover:bg-rose-500/20 border-white/10 text-zinc-400 hover:text-rose-400"
                  }`}
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`px-3 py-1.5 rounded-xl sm:rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isLight
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                    : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500/50 shadow-md shadow-purple-600/30"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            <div className="relative hidden xs:block sm:block" ref={themeRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2 rounded-xl sm:rounded-2xl border transition ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
                title="Cambiar apariencia"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl border shadow-2xl z-50 space-y-1 backdrop-blur-2xl ${
                      isLight
                        ? "bg-white/95 border-slate-200 text-slate-800"
                        : "bg-zinc-950/95 border-white/10 text-zinc-200"
                    }`}
                  >
                    {(Object.keys(THEMES) as ThemeMode[]).map((thm) => (
                      <button
                        key={thm}
                        onClick={() => handleSelectTheme(thm)}
                        className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                          currentTheme === thm
                            ? "bg-purple-600 text-white font-bold"
                            : isLight
                            ? "hover:bg-slate-100"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <span>{THEMES[thm].name}</span>
                        {currentTheme === thm && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden sm:block" ref={volumeRef}>
              <button
                onClick={() => setIsVolumePopoverOpen(!isVolumePopoverOpen)}
                className={`p-2 rounded-xl sm:rounded-2xl border transition flex items-center gap-1.5 ${
                  volume > 0
                    ? isLight
                      ? "bg-purple-100 border-purple-300 text-purple-700"
                      : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : isLight
                    ? "bg-slate-100 border-slate-200 text-slate-400"
                    : "bg-white/5 border-white/10 text-zinc-500"
                }`}
                title="Ajustar volumen"
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono font-bold">{volume}%</span>
              </button>

              <AnimatePresence>
                {isVolumePopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute right-0 top-full mt-2 w-48 p-3 rounded-2xl border shadow-2xl z-50 space-y-2 backdrop-blur-2xl ${
                      isLight ? "bg-white/95 border-slate-200 text-slate-800" : "bg-zinc-950/95 border-white/10 text-zinc-200"
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="opacity-60 text-[11px] font-semibold">Volumen de audio</span>
                      <span className="font-mono font-bold text-[11px]">{volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* HERO BANNER */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-10 backdrop-blur-xl transition-all duration-300 ${
            isLight
              ? "bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/40 border-slate-200 shadow-xl"
              : "bg-gradient-to-br from-zinc-900/90 via-purple-950/20 to-zinc-950/90 border-white/10 shadow-2xl shadow-purple-950/20"
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Cobblemon Gen 9 Meta Suite · Sincronización Cloud</span>
              </div>

              <h2 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight">
                Potencia tu juego <br />
                <span className={`bg-gradient-to-r ${currentThemeConfig.accent} bg-clip-text text-transparent`}>
                  al nivel de torneo
                </span>
              </h2>

              <p className="text-xs sm:text-base opacity-80 leading-relaxed">
                Arma alineaciones 6v6, exporta comandos <code className="text-purple-300 font-mono text-xs">/pokegive</code> para Minecraft y guarda tus metas de EVs en tu cuenta de Supabase con membresía VIP.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
                <button
                  onClick={() => setActiveModal("team-builder")}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs bg-gradient-to-r ${currentThemeConfig.accent} text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-1.5`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team Builder & Matchups</span>
                </button>

                <button
                  onClick={() => {
                    if (isModuleLocked(MODULES[4])) {
                      if (!currentUser) setIsAuthOpen(true);
                      else setIsSubModalOpen(true);
                    } else {
                      setIsEvCloudModalOpen(true);
                    }
                  }}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-semibold text-xs border transition flex items-center gap-1.5 ${
                    isLight ? "bg-white hover:bg-slate-100 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Rastreador de EVs Cloud</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NUEVO
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (isModuleLocked(MODULES[5])) {
                      if (!currentUser) setIsAuthOpen(true);
                      else setIsSubModalOpen(true);
                    } else {
                      setIsCommandsModalOpen(true);
                    }
                  }}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-semibold text-xs border transition flex items-center gap-1.5 ${
                    isLight ? "bg-white hover:bg-slate-100 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Exportar Comandos</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NUEVO
                  </span>
                </button>
              </div>
            </div>

            {/* Especie Destacada */}
            <motion.div
              whileHover={{ y: -4 }}
              className={`w-full md:w-auto p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center gap-4 transition shadow-xl group relative ${
                isLight ? "bg-white border-slate-200 hover:border-purple-400" : "bg-zinc-900/80 border-white/10 hover:border-purple-500/50"
              }`}
            >
              <div
                onClick={() => {
                  playPokemonCry(featuredPokemon.id);
                  setIsSearchOpen(true);
                }}
                className="cursor-pointer shrink-0"
              >
                <img
                  src={isFeaturedShiny ? featuredPokemon.shinySprite : featuredPokemon.sprite}
                  alt={featuredPokemon.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = featuredPokemon.fallbackSprite;
                  }}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-xl group-hover:scale-110 transition duration-300"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block tracking-wider">
                    ✦ Especie Destacada
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFeaturedShiny(!isFeaturedShiny);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition ${
                      isFeaturedShiny
                        ? "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30"
                        : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {isFeaturedShiny ? "★ Shiny" : "Normal"}
                  </button>
                </div>

                <h4
                  onClick={() => {
                    playPokemonCry(featuredPokemon.id);
                    setIsSearchOpen(true);
                  }}
                  className="text-base sm:text-lg font-black cursor-pointer hover:text-purple-400 transition"
                >
                  {featuredPokemon.name}
                </h4>

                <div className="flex items-center gap-1">
                  {featuredPokemon.types.map((t) => (
                    <span key={t} className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300">
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    playPokemonCry(featuredPokemon.id);
                    setIsSearchOpen(true);
                  }}
                  className="text-[10px] sm:text-[11px] opacity-60 block pt-1 font-medium group-hover:text-purple-400 transition text-left"
                >
                  Toca para oír grito y ver ficha →
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filtros */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "Todos los Módulos" },
              { id: "competitive", label: "Competitivo & Batalla" },
              { id: "minecraft", label: "Mundo de Minecraft" },
              { id: "breeding", label: "Crianza & Farmeo" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${currentThemeConfig.accent} text-white shadow-md shadow-purple-600/20`
                    : isLight
                    ? "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                    : "bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs opacity-60 font-mono hidden md:inline">
            {filteredModules.length} módulos disponibles
          </span>
        </div>

        {/* Grilla de Módulos */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredModules.map((module: ToolModule) => {
            const Icon = module.icon;
            const locked = isModuleLocked(module);

            return (
              <motion.div
                key={module.id}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleModuleClick(module)}
                className={`group relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${currentThemeConfig.cardBg} ${currentThemeConfig.cardBorder} ${module.shadowColor} ${
                  locked ? "ring-1 ring-amber-500/20" : ""
                }`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-hover:text-white transition" />
                      {locked && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                          <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {module.isNew && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm animate-pulse">
                          ✦ NUEVO
                        </span>
                      )}

                      {locked ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Requiere VIP</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-white/5 border border-white/10 opacity-80 flex items-center gap-1">
                          {module.flagKey && <Cloud className="w-3 h-3 text-purple-400" />}
                          <span>{module.badge}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold tracking-tight group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      <span>{module.title}</span>
                      {module.flagKey && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          [PRO]
                        </span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-xs opacity-70 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-5 pt-3 sm:mt-6 sm:pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold opacity-60 group-hover:opacity-100 transition">
                  <span className={locked ? "text-amber-300" : ""}>
                    {locked ? "Desbloquear con Membresía VIP" : "Abrir simulador"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="pt-6 sm:pt-8 pb-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60 text-center sm:text-left">
          <p>Ultramoon Cobblemon Competitive Suite · Gen 9 Mechanics · PWA Ready</p>
          <div className="flex items-center gap-3">
            <span className="font-mono">Tema: {currentThemeConfig.name}</span>
            <span>•</span>
            <button
              onClick={() => {
                if ("caches" in window) {
                  caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
                }
                window.location.reload();
              }}
              className="hover:text-purple-400 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar Caché</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Modales */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
          if (updated.preferred_theme) setCurrentTheme(updated.preferred_theme);
          if (updated.sound_volume !== undefined) setVolume(updated.sound_volume);
        }}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        user={currentUser}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSuccessRedeem={() => {
          setIsSubModalOpen(false);
          setIsWelcomeVipOpen(true);
          if (currentUser) {
            loadUserProfile(currentUser.id);
          }
        }}
      />

      <VipWelcomeModal
        isOpen={isWelcomeVipOpen}
        onClose={() => setIsWelcomeVipOpen(false)}
        trainerName={displayName}
      />

      <VipToastAlert
        isOpen={toastAlert.open}
        onClose={() => setToastAlert((prev) => ({ ...prev, open: false }))}
        title={toastAlert.title}
        description={toastAlert.desc}
        type={toastAlert.type}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        user={currentUser}
        onFeatureToggled={(featId, isPremium) => {
          setFeatureFlags((prev) => ({
            ...prev,
            [featId]: isPremium,
          }));
        }}
      />

      <ExportCommandsModal
        isOpen={isCommandsModalOpen}
        onClose={() => setIsCommandsModalOpen(false)}
        teamName="Equipo Competitivo"
        pokemonList={[]}
        trainerName={userProfile?.trainer_name || userProfile?.minecraft_username || "@s"}
      />

      <EvTrackerCloudModal
        isOpen={isEvCloudModalOpen}
        onClose={() => setIsEvCloudModalOpen(false)}
        user={currentUser}
      />

      {/* Herramientas Principales */}
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