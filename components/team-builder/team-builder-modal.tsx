"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  BookOpen,
  Terminal,
  Edit2,
  Save,
  Upload,
  Sliders,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Archive,
  ArrowRightLeft,
  Flame,
  Droplet,
  Leaf,
  Layers,
  Link,
  MessageSquare,
  FileText,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface TeamMember extends PokemonData {
  memberId: string;
  customItem?: string;
  customNature?: string;
  customMoves?: [string, string, string, string];
}

interface SavedTeam {
  id: string;
  name: string;
  pokemonList: TeamMember[];
  matchupNotes?: string;
}

interface TeamBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_POKEMON: PokemonData[] = (POKEDEX_DATA as unknown) as PokemonData[];

const ALL_TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Steel", "Dark", "Fairy"
];

const DEFENSIVE_TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: { Fighting: 2, Ghost: 0 },
  Fire: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Ice: 0.5, Bug: 0.5, Steel: 0.5, Fairy: 0.5 },
  Water: { Electric: 2, Grass: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
  Grass: { Fire: 2, Ice: 2, Poison: 2, Flying: 2, Bug: 2, Water: 0.5, Electric: 0.5, Grass: 0.5, Ground: 0.5 },
  Electric: { Ground: 2, Electric: 0.5, Flying: 0.5, Steel: 0.5 },
  Ice: { Fire: 2, Fighting: 2, Rock: 2, Steel: 2, Ice: 0.5 },
  Fighting: { Flying: 2, Psychic: 2, Fairy: 2, Bug: 0.5, Rock: 0.5, Dark: 0.5 },
  Poison: { Ground: 2, Psychic: 2, Grass: 0.5, Fighting: 0.5, Poison: 0.5, Bug: 0.5, Fairy: 0.5 },
  Ground: { Water: 2, Grass: 2, Ice: 2, Electric: 0, Poison: 0.5, Rock: 0.5 },
  Flying: { Electric: 2, Ice: 2, Rock: 2, Ground: 0, Grass: 0.5, Fighting: 0.5, Bug: 0.5 },
  Psychic: { Bug: 2, Ghost: 2, Dark: 2, Fighting: 0.5, Psychic: 0.5 },
  Bug: { Fire: 2, Flying: 2, Rock: 2, Grass: 0.5, Fighting: 0.5, Ground: 0.5 },
  Rock: { Water: 2, Grass: 2, Fighting: 2, Ground: 2, Steel: 2, Normal: 0.5, Fire: 0.5, Poison: 0.5, Flying: 0.5 },
  Ghost: { Ghost: 2, Dark: 2, Normal: 0, Fighting: 0, Poison: 0.5, Bug: 0.5 },
  Dragon: { Ice: 2, Dragon: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 0.5 },
  Steel: { Fire: 2, Fighting: 2, Ground: 2, Poison: 0, Normal: 0.5, Grass: 0.5, Ice: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 0.5, Dragon: 0.5, Steel: 0.5, Fairy: 0.5 },
  Dark: { Fighting: 2, Bug: 2, Fairy: 2, Psychic: 0, Ghost: 0.5, Dark: 0.5 },
  Fairy: { Poison: 2, Steel: 2, Dragon: 0, Fighting: 0.5, Bug: 0.5, Dark: 0.5 },
};

const OFFENSIVE_SUPER_EFFECTIVE: Record<string, string[]> = {
  Normal: [],
  Fire: ["Grass", "Ice", "Bug", "Steel"],
  Water: ["Fire", "Ground", "Rock"],
  Grass: ["Water", "Ground", "Rock"],
  Electric: ["Water", "Flying"],
  Ice: ["Grass", "Ground", "Flying", "Dragon"],
  Fighting: ["Normal", "Ice", "Rock", "Dark", "Steel"],
  Poison: ["Grass", "Fairy"],
  Ground: ["Fire", "Electric", "Poison", "Rock", "Steel"],
  Flying: ["Grass", "Fighting", "Bug"],
  Psychic: ["Fighting", "Poison"],
  Bug: ["Grass", "Psychic", "Dark"],
  Rock: ["Fire", "Ice", "Flying", "Bug"],
  Ghost: ["Psychic", "Ghost"],
  Dragon: ["Dragon"],
  Steel: ["Ice", "Rock", "Fairy"],
  Dark: ["Psychic", "Ghost"],
  Fairy: ["Fighting", "Dragon", "Dark"],
};

export function TeamBuilderModal({ isOpen, onClose }: TeamBuilderModalProps) {
  const [teams, setTeams] = useState<SavedTeam[]>([
    { id: "default-team-1", name: "Equipo Principal VGC", pokemonList: [], matchupNotes: "" },
  ]);
  const [activeTeamId, setActiveTeamId] = useState<string>("default-team-1");
  const [storageBox, setStorageBox] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<"team" | "pc" | "notes">("team");
  const [matrixTab, setMatrixTab] = useState<"defense" | "offense" | "synergy">("defense");

  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ultramoon_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTeams(parsed);
      } catch (e) {}
    }
  }, []);

  const saveTeamsToStorage = (updatedTeams: SavedTeam[]) => {
    setTeams(updatedTeams);
    localStorage.setItem("ultramoon_teams", JSON.stringify(updatedTeams));
  };

  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  const handleUpdateNotes = (notes: string) => {
    if (!activeTeam) return;
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) return { ...t, matchupNotes: notes };
      return t;
    });
    saveTeamsToStorage(updated);
  };

  // Cores de Sinergia
  const synergyData = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return null;

    const types = new Set(activeTeam.pokemonList.flatMap((p) => p.types.map((t) => t.toLowerCase())));

    const hasFire = types.has("fire");
    const hasWater = types.has("water");
    const hasGrass = types.has("grass");
    const hasFwg = hasFire && hasWater && hasGrass;

    const hasDragon = types.has("dragon");
    const hasSteel = types.has("steel");
    const hasFairy = types.has("fairy");
    const hasDsf = hasDragon && hasSteel && hasFairy;

    const hasGround = types.has("ground");

    const recommendations: string[] = [];
    if (!hasWater) recommendations.push("Urshifu-R / Rotom-Wash / Toxapex");
    if (!hasSteel) recommendations.push("Gholdengo / Kingambit / Scizor");
    if (!hasFairy) recommendations.push("Flutter Mane / Clefable / Iron Valiant");
    if (!hasGround) recommendations.push("Landorus-T / Great Tusk / Gliscor");

    return { hasFwg, hasDsf, recommendations };
  }, [activeTeam]);

  // Coberturas
  const coverageAnalysis = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return null;
    const analysis: Record<string, { weak: number; resist: number; immune: number }> = {};
    ALL_TYPES.forEach((t) => {
      analysis[t] = { weak: 0, resist: 0, immune: 0 };
    });

    activeTeam.pokemonList.forEach((member) => {
      ALL_TYPES.forEach((attackType) => {
        let mult = 1;
        member.types.forEach((defType) => {
          const capDef = defType.charAt(0).toUpperCase() + defType.slice(1).toLowerCase();
          const effect = DEFENSIVE_TYPE_CHART[capDef]?.[attackType];
          if (effect !== undefined) mult *= effect;
        });

        if (mult > 1) analysis[attackType].weak += 1;
        else if (mult === 0) analysis[attackType].immune += 1;
        else if (mult < 1) analysis[attackType].resist += 1;
      });
    });

    const highVulnerabilities = Object.entries(analysis).filter(([_, data]) => data.weak >= 3);
    return { analysis, highVulnerabilities };
  }, [activeTeam]);

  const offensiveCoverage = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return null;
    const teamStabTypes = new Set<string>();
    activeTeam.pokemonList.forEach((member) => {
      member.types.forEach((t) => {
        teamStabTypes.add(t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
      });
    });

    const coverageCount: Record<string, number> = {};
    ALL_TYPES.forEach((t) => {
      coverageCount[t] = 0;
    });

    teamStabTypes.forEach((attackType) => {
      const targets = OFFENSIVE_SUPER_EFFECTIVE[attackType] || [];
      targets.forEach((targetType) => {
        coverageCount[targetType] = (coverageCount[targetType] || 0) + 1;
      });
    });

    const blindSpots = Object.entries(coverageCount).filter(([_, count]) => count === 0).map(([type]) => type);
    return { coverageCount, blindSpots };
  }, [activeTeam]);

  // Generador Markdown para Discord
  const exportDiscordMarkdown = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    let md = `🏆 **${activeTeam.name.toUpperCase()}** — *Cobblemon Suite*\n`;
    md += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    activeTeam.pokemonList.forEach((p, idx) => {
      md += `**#${idx + 1} ${p.name}** @ \`${p.customItem || "Leftovers"}\`\n`;
      md += `▸ *Naturaleza:* ${p.customNature || "Timid"} | *Habilidad:* ${p.abilities?.primary || "Overgrow"}\n`;
      md += `▸ *Ataques:* ${(p.customMoves || ["Protect", "Substitute", "Tackle", "Rest"]).join(" • ")}\n\n`;
    });
    if (activeTeam.matchupNotes?.trim()) {
      md += `📋 **Notas de Combate:**\n${activeTeam.matchupNotes}\n`;
    }
    return md;
  }, [activeTeam]);

  const handleAddPokemon = (pokemon: PokemonData) => {
    if (!activeTeam || activeTeam.pokemonList.length >= 6) return;
    const newMember: TeamMember = {
      ...pokemon,
      memberId: "m-" + Date.now() + Math.random(),
      customItem: "Leftovers",
      customNature: "Timid",
      customMoves: ["Protect", "Substitute", "Tackle", "Rest"],
    };

    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) return { ...t, pokemonList: [...t.pokemonList, newMember] };
      return t;
    });

    saveTeamsToStorage(updated);
    setIsPickerOpen(false);
  };

  const handleRemovePokemon = (memberId: string) => {
    if (!activeTeam) return;
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) {
        return { ...t, pokemonList: t.pokemonList.filter((m) => m.memberId !== memberId) };
      }
      return t;
    });
    saveTeamsToStorage(updated);
  };

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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Team Builder & Matchups</h2>
                <p className="text-xs text-zinc-400">
                  Gestión 6v6, sinergias, libreta de planes tácticos y exportador Discord
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportDiscordMarkdown);
                  setCopiedDiscord(true);
                  setTimeout(() => setCopiedDiscord(false), 2000);
                }}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                {copiedDiscord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5" />}
                <span>{copiedDiscord ? "¡Copiado!" : "Discord"}</span>
              </button>

              <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selector de Pestañas Principales */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "team" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Equipo Titular ({activeTeam?.pokemonList.length || 0}/6)</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "notes" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Libreta de Matchups</span>
            </button>
          </div>

          {/* VISTA 1: SLOTS */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Slots de Batalla:
                </span>

                {activeTeam && activeTeam.pokemonList.length < 6 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Pokémon</span>
                    </button>

                    <AnimatePresence>
                      {isPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                        >
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar en la Dex..."
                            autoFocus
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 mb-2"
                          />
                          <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                            {ALL_POKEMON.slice(0, 30).map((p) => (
                              <button
                                key={p.id + "-" + p.name}
                                onClick={() => handleAddPokemon(p)}
                                className="w-full p-2 rounded-xl flex items-center justify-between text-left hover:bg-white/[0.06] text-zinc-300 transition text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <img src={p.sprite} alt={p.name} className="w-6 h-6 object-contain" />
                                  <span>{p.name}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono">#{p.id}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const member = activeTeam?.pokemonList[idx];

                  if (!member) {
                    return (
                      <div
                        key={idx}
                        className="h-28 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-zinc-600 gap-1"
                      >
                        <span className="text-xs font-mono">Slot #{idx + 1}</span>
                        <span className="text-[10px]">Vacío</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={member.memberId}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={member.sprite} alt={member.name} className="w-12 h-12 object-contain shrink-0 drop-shadow" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">{member.name}</span>
                          <span className="text-[9px] text-amber-300 font-mono block">@{member.customItem || "Leftovers"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePokemon(member.memberId)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 2: LIBRETA DE MATCHUPS */}
          {activeTab === "notes" && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Estrategias & Notas de Enfrentamiento (Matchups)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Guardado automático</span>
              </div>

              <textarea
                value={activeTeam?.matchupNotes || ""}
                onChange={(e) => handleUpdateNotes(e.target.value)}
                placeholder="Anota aquí tus planes de juego para el servidor (Ej: 'Vs Lluvia: Salir con Rillaboom + Archaludon y meter Campo de Hierba', 'Vs Stall: Cuidar a Gholdengo para bloquear Tóxico')..."
                rows={6}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 leading-relaxed font-sans"
              />
            </div>
          )}

          {/* MATRIZ TÁCTICA & CORES */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setMatrixTab("defense")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "defense" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Defensa
              </button>
              <button
                onClick={() => setMatrixTab("offense")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "offense" ? "bg-cyan-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Ataque
              </button>
              <button
                onClick={() => setMatrixTab("synergy")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "synergy" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Cores Meta
              </button>
            </div>

            {matrixTab === "defense" && coverageAnalysis && (
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5 text-center">
                {ALL_TYPES.map((t) => {
                  const data = coverageAnalysis.analysis[t];
                  const isHighWeak = data.weak >= 3;
                  return (
                    <div
                      key={t}
                      className={`p-2 rounded-xl border ${
                        isHighWeak ? "bg-rose-500/20 border-rose-500/50" : "bg-zinc-950 border-white/5"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-zinc-300 block truncate">{t}</span>
                      <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-mono">
                        <span className={data.weak > 0 ? "text-rose-400 font-bold" : "text-zinc-600"}>-{data.weak}</span>
                        <span className={data.resist > 0 ? "text-emerald-400 font-bold" : "text-zinc-600"}>+{data.resist}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {matrixTab === "offense" && offensiveCoverage && (
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5 text-center">
                {ALL_TYPES.map((t) => {
                  const count = offensiveCoverage.coverageCount[t] || 0;
                  return (
                    <div
                      key={t}
                      className={`p-2 rounded-xl border ${
                        count === 0 ? "bg-amber-500/15 border-amber-500/40" : "bg-cyan-500/15 border-cyan-500/30"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-zinc-300 block truncate">{t}</span>
                      <span className="text-[10px] font-mono font-bold block mt-1 text-cyan-300">
                        {count === 0 ? "Ciego" : `${count}x STAB`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {matrixTab === "synergy" && synergyData && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${synergyData.hasFwg ? "bg-emerald-500/15 border-emerald-500/30" : "bg-zinc-950 border-white/5"}`}>
                    <span className="font-bold text-white block mb-0.5">Núcleo FWG (Fuego/Agua/Planta)</span>
                    <span className="text-[11px] text-zinc-400">
                      {synergyData.hasFwg ? "✓ Tríada completa activa" : "Incompleto"}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${synergyData.hasDsf ? "bg-purple-500/15 border-purple-500/30" : "bg-zinc-950 border-white/5"}`}>
                    <span className="font-bold text-white block mb-0.5">Núcleo DSF (Dragón/Acero/Hada)</span>
                    <span className="text-[11px] text-zinc-400">
                      {synergyData.hasDsf ? "✓ Tríada completa activa" : "Incompleto"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
