"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Egg,
  Search,
  Sparkles,
  Layers,
  Heart,
  ChevronDown,
  Info,
  Dna,
  Flame,
  Footprints,
  Plus,
  Minus,
  AlertTriangle,
  CircleDot,
  Sprout,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface PastureSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Gender = "male" | "female";
type BreedingItem =
  | "none"
  | "destiny_knot"
  | "everstone"
  | "mirror_herb"
  | "power_weight"
  | "power_bracer";

const BREEDING_ITEMS_CONFIG: Record<
  BreedingItem,
  { name: string; desc: string; icon: string }
> = {
  none: { name: "Sin objeto", desc: "Herencia estándar aleatoria de 3 IVs", icon: "⚪" },
  destiny_knot: { name: "Lazo Destino", desc: "Garantiza heredar 5 IVs de los padres", icon: "🎀" },
  everstone: { name: "Piedra Eterna", desc: "Traspasa la Naturaleza al 100%", icon: "🪨" },
  mirror_herb: { name: "Hierba Copia (Gen 9)", desc: "Transfiere Egg Moves sin criar", icon: "🌿" },
  power_weight: { name: "Pesa Recia", desc: "Hereda el IV de PS fijo", icon: "🏋️" },
  power_bracer: { name: "Brazal Recio", desc: "Hereda el IV de Ataque fijo", icon: "🥊" },
};

const POKEBALL_OPTIONS = [
  "Poké Ball",
  "Super Ball",
  "Ultra Ball",
  "Honor Ball (Premier)",
  "Buceo Ball (Dive)",
  "Ocaso Ball (Dusk)",
  "Luna Ball (Moon)",
  "Amor Ball (Love)",
  "Ente Ball (Beast)",
];

const BABY_MAP: Record<string, string> = {
  ivysaur: "Bulbasaur",
  venusaur: "Bulbasaur",
  charmeleon: "Charmander",
  charizard: "Charmander",
  wartortle: "Squirtle",
  blastoise: "Squirtle",
  metapod: "Caterpie",
  butterfree: "Caterpie",
  kakuna: "Weedle",
  beedrill: "Weedle",
  pidgeotto: "Pidgey",
  pidgeot: "Pidgey",
  raticate: "Rattata",
  fearow: "Spearow",
  arbok: "Ekans",
  raichu: "Pikachu",
  sandslash: "Sandshrew",
  nidorina: "Nidoran-f",
  nidoqueen: "Nidoran-f",
  nidorino: "Nidoran-m",
  nidoking: "Nidoran-m",
  clefable: "Clefairy",
  ninetales: "Vulpix",
  wigglytuff: "Jigglypuff",
  golbat: "Zubat",
  crobat: "Zubat",
  vileplume: "Oddish",
  bellossom: "Oddish",
  parasect: "Paras",
  venomoth: "Venonat",
  dugtrio: "Diglett",
  persian: "Meowth",
  golduck: "Psyduck",
  primeape: "Mankey",
  arcanine: "Growlithe",
  annihilape: "Mankey",
  lucario: "Riolu",
  garchomp: "Gible",
  gabite: "Gible",
  tyranitar: "Larvitar",
  pupitar: "Larvitar",
  salamence: "Bagon",
  shelgon: "Bagon",
  metagross: "Beldum",
  metang: "Beldum",
  meowscarada: "Sprigatito",
  floragato: "Sprigatito",
  skeledirge: "Fuecoco",
  crocalor: "Fuecoco",
  quaquaval: "Quaxly",
  quaxwell: "Quaxly",
  tinkaton: "Tinkatink",
  tinkatuff: "Tinkatink",
  ceruledge: "Charcadet",
  armarouge: "Charcadet",
  baxcalibur: "Frigibax",
  arctibax: "Frigibax",
};

function getBabyForm(pokemon?: PokemonData): PokemonData {
  if (!pokemon) return SAMPLE_POKEMON[0];
  const targetBabyName = BABY_MAP[pokemon.name.toLowerCase()];
  if (!targetBabyName) return pokemon;
  const found = SAMPLE_POKEMON.find(
    (p) => p.name.toLowerCase() === targetBabyName.toLowerCase()
  );
  return found || pokemon;
}

function PokemonPicker({
  label,
  selected,
  gender,
  onSelect,
  onToggleGender,
  isDitto,
}: {
  label: string;
  selected: PokemonData;
  gender: Gender;
  onSelect: (p: PokemonData) => void;
  onToggleGender: () => void;
  isDitto: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return SAMPLE_POKEMON.slice(0, 35);
    const q = query.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [query]);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
          {label}
        </span>

        {!isDitto ? (
          <button
            type="button"
            onClick={onToggleGender}
            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              gender === "male"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
            title="Cambiar sexo"
          >
            <span>{gender === "male" ? "♂ Macho" : "♀ Hembra"}</span>
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Asexuado
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 flex items-center justify-between transition gap-2 group text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={selected?.sprite || ""}
            alt={selected?.name || "Pokemon"}
            className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
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
                placeholder="Escribe nombre o tipo..."
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
                      selected?.id === p.id
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                        : "hover:bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={p.sprite}
                        alt={p.name}
                        className="w-7 h-7 object-contain shrink-0"
                      />
                      <span className="text-xs font-medium truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      #{p.id}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No se encontró ningún Pokémon
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PastureSimulator({ isOpen, onClose }: PastureSimulatorProps) {
  // 1. Hooks de estado incondicionales
  const [parent1, setParent1] = useState<PokemonData>(SAMPLE_POKEMON[0] || ({} as PokemonData));
  const [parent2, setParent2] = useState<PokemonData>(
    SAMPLE_POKEMON[1] || SAMPLE_POKEMON[0] || ({} as PokemonData)
  );

  const [gender1, setGender1] = useState<Gender>("male");
  const [gender2, setGender2] = useState<Gender>("female");

  const [ball1, setBall1] = useState<string>("Poké Ball");
  const [ball2, setBall2] = useState<string>("Ultra Ball");

  const [item1, setItem1] = useState<BreedingItem>("destiny_knot");
  const [item2, setItem2] = useState<BreedingItem>("everstone");

  const [placedBlocks, setPlacedBlocks] = useState<number>(16);
  const [hasFlameBody, setHasFlameBody] = useState<boolean>(false);

  // 2. Cálculos derivados y lógica de crianza
  const isDitto1 = parent1?.name?.toLowerCase() === "ditto";
  const isDitto2 = parent2?.name?.toLowerCase() === "ditto";
  const isDittoBreeding = isDitto1 || isDitto2;

  const isGenderCompatible = isDittoBreeding || gender1 !== gender2;
  const shareEggGroup = parent1?.eggGroups?.some((group) => parent2?.eggGroups?.includes(group));
  const isCompatible = isGenderCompatible && (shareEggGroup || isDittoBreeding);

  const speciesBearer = isDittoBreeding
    ? isDitto1
      ? parent2
      : parent1
    : gender1 === "female"
    ? parent1
    : parent2;

  const babyPokemon = getBabyForm(speciesBearer);

  // 3. Hooks de useMemo incondicionales (siempre se llaman en cada render)
  const inheritedBallText = useMemo(() => {
    if (isDittoBreeding) {
      return isDitto1 ? ball2 : ball1;
    }
    if (parent1?.name?.toLowerCase() === parent2?.name?.toLowerCase()) {
      return ball1 === ball2 ? ball1 : `50% ${ball1} / 50% ${ball2}`;
    }
    return gender1 === "female" ? ball1 : ball2;
  }, [isDittoBreeding, isDitto1, parent1?.name, parent2?.name, ball1, ball2, gender1]);

  const eggIntervalMinutes = useMemo(() => {
    if (!isCompatible) return 0;
    if (placedBlocks >= 24) return 12;
    if (placedBlocks >= 12) return 20;
    return 35;
  }, [isCompatible, placedBlocks]);

  const hasMirrorHerb = item1 === "mirror_herb" || item2 === "mirror_herb";
  const usesDestinyKnot = item1 === "destiny_knot" || item2 === "destiny_knot";
  const inheritedIVsCount = usesDestinyKnot ? 5 : 3;

  const baseEggSteps = 5120;
  const actualEggSteps = hasFlameBody ? Math.floor(baseEggSteps / 2) : baseEggSteps;

  const p1Types = parent1?.types || [];
  const p2Types = parent2?.types || [];

  const blockOptionsByTypes = Array.from(
    new Set([
      ...(p1Types.includes("fire") || p2Types.includes("fire") ? ["Hoguera", "Magma", "Lava"] : []),
      ...(p1Types.includes("water") || p2Types.includes("water") ? ["Agua", "Prismarina", "Alga"] : []),
      ...(p1Types.includes("grass") || p2Types.includes("grass") ? ["Heno", "Flores", "Hojas"] : []),
      ...(p1Types.includes("electric") || p2Types.includes("electric") ? ["Pararrayos", "Cobre", "Lámpara"] : []),
      ...(p1Types.includes("rock") || p2Types.includes("rock") || p1Types.includes("ground") || p2Types.includes("ground") ? ["Piedra", "Barro", "Arena"] : []),
    ])
  );

  const defaultBlocks = ["Heno", "Césped", "Flores", "Farol"];
  const finalBlocks = blockOptionsByTypes.length >= 4 ? blockOptionsByTypes.slice(0, 4) : defaultBlocks;

  // 4. Render condicional dentro del JSX para respetar las Reglas de Hooks
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
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/[0.08] rounded-3xl shadow-2xl z-50 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Egg className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Simulador de Pasture Block & Crianza (Gen 9)
                </h2>
                <p className="text-xs text-zinc-400">
                  Herencia de Poké Balls, Hierba Copia, eclosión de pasos y recinto en Cobblemon
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

          {/* 1. SELECTOR DE PADRES, POKÉ BALL Y OBJETOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Padre 1 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <PokemonPicker
                label="Progenitor 1"
                selected={parent1}
                gender={gender1}
                onSelect={(p) => setParent1(p)}
                onToggleGender={() => setGender1(gender1 === "male" ? "female" : "male")}
                isDitto={isDitto1}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Poké Ball:
                  </label>
                  <select
                    value={ball1}
                    onChange={(e) => setBall1(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {POKEBALL_OPTIONS.map((ball) => (
                      <option key={ball} value={ball}>
                        {ball}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Objeto Equipado:
                  </label>
                  <select
                    value={item1}
                    onChange={(e) => setItem1(e.target.value as BreedingItem)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(BREEDING_ITEMS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.icon} {cfg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Padre 2 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <PokemonPicker
                label="Progenitor 2"
                selected={parent2}
                gender={gender2}
                onSelect={(p) => setParent2(p)}
                onToggleGender={() => setGender2(gender2 === "male" ? "female" : "male")}
                isDitto={isDitto2}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Poké Ball:
                  </label>
                  <select
                    value={ball2}
                    onChange={(e) => setBall2(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {POKEBALL_OPTIONS.map((ball) => (
                      <option key={ball} value={ball}>
                        {ball}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Objeto Equipado:
                  </label>
                  <select
                    value={item2}
                    onChange={(e) => setItem2(e.target.value as BreedingItem)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(BREEDING_ITEMS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.icon} {cfg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEMÁFORO DE AFINIDAD */}
          <div className="mt-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Estado en el Pasture:</span>
              <div className="flex items-center gap-1">
                {isCompatible ? (
                  <>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-rose-400 ml-1">
                      {placedBlocks >= 24 ? "Nivel 3 (Máximo)" : "Nivel 2 (Compatible)"}
                    </span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-zinc-600" />
                    <Heart className="w-4 h-4 text-zinc-600" />
                    <Heart className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-500 ml-1">Incompatibles</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-zinc-300">
              {isCompatible ? (
                <span>
                  ⏱️ Un huevo cada: <b className="text-amber-400">~{eggIntervalMinutes} minutos</b>
                </span>
              ) : !isGenderCompatible ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Requiere sexos opuestos (♂ + ♀) o un Ditto
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> No comparten Grupo Huevo
                </span>
              )}
            </div>
          </div>

          {/* 3. RESULTADO DE LA CRÍA */}
          {isCompatible && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  Cría resultante del huevo (Forma Base)
                </span>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="relative my-2"
                >
                  <img
                    src={babyPokemon?.sprite || ""}
                    alt={babyPokemon?.name || "Bebé"}
                    className="w-20 h-20 object-contain drop-shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    Lv. 1
                  </div>
                </motion.div>

                <h4 className="font-bold text-base text-white font-['Space_Grotesk',sans-serif]">
                  {babyPokemon?.name}
                </h4>
                <span className="text-[11px] text-zinc-300 capitalize mb-3">
                  Tipos: {babyPokemon?.types?.join(" / ")}
                </span>

                <div className="w-full p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5 text-rose-400" />
                    Ball Heredada:
                  </span>
                  <span className="font-semibold text-white">{inheritedBallText}</span>
                </div>

                <div className="mt-2 w-full flex justify-between text-[11px] text-zinc-300 px-1">
                  <span>Habilidad Oculta:</span>
                  <span className="font-bold text-emerald-400">60% si la madre la porta</span>
                </div>
              </div>

              {/* Herencia Genética */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Dna className="w-4 h-4 text-purple-400" />
                      Herencia de Estadísticas (IVs)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {inheritedIVsCount} de 6 IVs garantizados
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mb-3">
                    {usesDestinyKnot
                      ? "Con Lazo Destino equipado, la cría toma 5 IVs directamente de los padres y solo 1 es generado al azar (0-31)."
                      : "Sin Lazo Destino, solo 3 estadísticas provienen de los padres y 3 son completamente aleatorias."}
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    {["PS", "Ataque", "Defensa", "Sp. Atq", "Sp. Def", "Velocidad"].map((stat, i) => {
                      const isInherited = i < inheritedIVsCount;
                      return (
                        <div
                          key={stat}
                          className={`p-2 rounded-xl border ${
                            isInherited
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                              : "bg-white/[0.02] border-white/5 text-zinc-500"
                          }`}
                        >
                          <span className="text-[10px] block">{stat}</span>
                          <span className="text-[11px]">
                            {isInherited ? "Heredado" : "Aleatorio"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-zinc-400 pt-2 border-t border-white/[0.04] flex justify-between">
                  <span>Naturaleza fija:</span>
                  <span className="font-semibold text-white">
                    {item1 === "everstone" || item2 === "everstone"
                      ? "Garantizada por Piedra Eterna"
                      : "Aleatoria (1 de 25)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AVISO GEN 9: HIERBA COPIA */}
          {hasMirrorHerb && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <Sprout className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  Mecánica Gen 9 Activa: Transferencia con Hierba Copia (Mirror Herb)
                </span>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  El Pokémon que lleva equipada la <b>Hierba Copia</b> aprenderá cualquier <b>Movimiento Huevo (Egg Move)</b> del otro Pokémon en el Pasture inmediatamente si tiene al menos un hueco libre en sus 4 movimientos. ¡No requiere poner huevos!
                </p>
              </div>
            </div>
          )}

          {/* 4. PASOS DE ECLOSIÓN EN MINECRAFT */}
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Footprints className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Pasos para Eclosionar el Huevo
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Caminar en Minecraft: <b className="text-amber-300">{actualEggSteps.toLocaleString()} pasos</b>
                </span>
              </div>
            </div>

            <button
              onClick={() => setHasFlameBody(!hasFlameBody)}
              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition ${
                hasFlameBody
                  ? "bg-red-500/20 border-red-500/40 text-red-300"
                  : "bg-white/[0.02] border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${hasFlameBody ? "text-red-400 animate-pulse" : "text-zinc-500"}`} />
              <span>Cuerpo Llama en el equipo (-50% pasos)</span>
            </button>
          </div>

          {/* 5. RECINTO Y BLOQUES AFINES */}
          <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-white">
                  Contador de Bloques Afines en el Recinto (Radio del Pasture)
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-zinc-400">Bloques puestos:</span>
                <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-0.5">
                  <button
                    onClick={() => setPlacedBlocks(Math.max(4, placedBlocks - 4))}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold text-amber-400">
                    {placedBlocks} / 32
                  </span>
                  <button
                    onClick={() => setPlacedBlocks(Math.min(32, placedBlocks + 4))}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              <div className="grid grid-cols-3 gap-1.5 p-3 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 shadow-inner">
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[0]}</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[1]}</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[0]}</span>
                </div>

                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[2]}</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-amber-500/20 border-2 border-amber-500 flex flex-col items-center justify-center text-[10px] font-bold text-amber-300 shadow-md shadow-amber-500/20">
                  <Egg className="w-4 h-4 text-amber-400 mb-0.5" />
                  <span>Pasture</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[2]}</span>
                </div>

                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[3]}</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[1]}</span>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-[10px] text-zinc-300">
                  <span>{finalBlocks[3]}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <span className="font-bold text-white block">Reglas de optimización:</span>
                <p className="leading-relaxed text-zinc-400">
                  Coloca bloques afines como <b>{finalBlocks.join(", ")}</b> alrededor del Pasture Block. Cuantos más bloques coloques (hasta 32), más rápido subirá el nivel de afecto.
                </p>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-amber-300">
                  💡 <b>Consejo:</b> Si pones 24 o más bloques, reduces el tiempo de espera por huevo a solo <b>12 minutos</b>.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
