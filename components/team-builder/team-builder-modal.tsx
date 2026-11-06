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

// Tabla elemental estándar de efectividades (multiplicador defensivo)
const TYPE_CHART: Record<string, Record<string, number>> = {
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

const COMMON_ITEMS = [
  "Leftovers", "Life Orb", "Focus Sash", "Assault Vest", "Choice Band",
  "Choice Specs", "Choice Scarf", "Heavy-Duty Boots", "Rocky Helmet", "Eviolite", "Sitrus Berry"
];

const COMMON_NATURES = [
  "Timid", "Jolly", "Modest", "Adamant", "Bold", "Calm", "Impish", "Careful", "Brave", "Quiet"
];

const DEFAULT_TEAMS: SavedTeam[] = [
  { id: "default-team-1", name: "Equipo Principal VGC", pokemonList: [] },
];

export function TeamBuilderModal({ isOpen, onClose }: TeamBuilderModalProps) {
  const [teams, setTeams] = useState<SavedTeam[]>(DEFAULT_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<string>("default-team-1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const [copiedShowdown, setCopiedShowdown] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ultramoon_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeams(parsed);
          setActiveTeamId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveTeamsToStorage = (updatedTeams: SavedTeam[]) => {
    setTeams(updatedTeams);
    localStorage.setItem("ultramoon_teams", JSON.stringify(updatedTeams));
  };

  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  useEffect(() => {
    if (activeTeam) setTeamNameInput(activeTeam.name);
  }, [activeTeam]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const availablePokemon = useMemo(() => {
    if (!searchQuery.trim()) return ALL_POKEMON.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return ALL_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [searchQuery]);

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
      if (t.id === activeTeam.id) {
        return { ...t, pokemonList: [...t.pokemonList, newMember] };
      }
      return t;
    });

    saveTeamsToStorage(updated);
    setIsPickerOpen(false);
    setSearchQuery("");
  };

  const handleRemovePokemon = (memberId: string) => {
    if (!activeTeam) return;
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) {
        return {
          ...t,
          pokemonList: t.pokemonList.filter((m) => m.memberId !== memberId),
        };
      }
      return t;
    });
    saveTeamsToStorage(updated);
  };

  const handleSaveMemberCustomization = (updatedMember: TeamMember) => {
    if (!activeTeam) return;
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) {
        return {
          ...t,
          pokemonList: t.pokemonList.map((m) =>
            m.memberId === updatedMember.memberId ? updatedMember : m
          ),
        };
      }
      return t;
    });
    saveTeamsToStorage(updated);
    setEditingMember(null);
  };

  // Cálculo de Matriz de Cobertura y Debilidades de los 18 tipos
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
          const effect = TYPE_CHART[capDef]?.[attackType];
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

  // Importador Showdown
  const handleImportShowdown = () => {
    if (!importText.trim()) return;
    const blocks = importText.trim().split(/\n\s*\n/);
    const newMembers: TeamMember[] = [];

    for (const block of blocks.slice(0, 6)) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const firstLine = lines[0];
      let rawName = firstLine;
      let item = "Leftovers";

      if (firstLine.includes("@")) {
        const parts = firstLine.split("@");
        rawName = parts[0].trim().replace(/\s*\(.*\)/, "");
        item = parts[1].trim();
      }

      let nature = "Adamant";
      const natureLine = lines.find((l) => l.toLowerCase().includes("nature"));
      if (natureLine) {
        nature = natureLine.split(" ")[0].trim();
      }

      const moveLines = lines
        .filter((l) => l.startsWith("-"))
        .map((l) => l.replace(/^-\s*/, "").trim());

      const customMoves: [string, string, string, string] = [
        moveLines[0] || "Protect",
        moveLines[1] || "Substitute",
        moveLines[2] || "Tackle",
        moveLines[3] || "Rest",
      ];

      const found = ALL_POKEMON.find(
        (p) => p.name.toLowerCase() === rawName.toLowerCase()
      ) || {
        id: 999,
        name: rawName,
        types: ["Normal"],
        stats: { hp: 80, attack: 80, defense: 80, specialAttack: 80, specialDefense: 80, speed: 80 },
        eggGroups: ["Field"],
        biomes: ["Plains"],
        abilities: { primary: "Overgrow" },
        sprite: `https://play.pokemonshowdown.com/sprites/gen5/${rawName.toLowerCase().replace(/[^a-z0-9]/g, "")}.png`,
      };

      newMembers.push({
        ...found,
        name: rawName,
        memberId: "m-" + Date.now() + Math.random(),
        customItem: item,
        customNature: nature,
        customMoves: customMoves,
      });
    }

    if (newMembers.length > 0 && activeTeam) {
      const updated = teams.map((t) => {
        if (t.id === activeTeam.id) {
          return { ...t, pokemonList: newMembers };
        }
        return t;
      });
      saveTeamsToStorage(updated);
      setIsImportModalOpen(false);
      setImportText("");
    }
  };

  const exportShowdownText = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    return activeTeam.pokemonList
      .map((p) => {
        const item = p.customItem || "Leftovers";
        const nature = p.customNature || "Timid";
        const ability = p.abilities?.primary || "Overgrow";
        const moves = p.customMoves || ["Protect", "Substitute", "Tackle", "Rest"];

        return `${p.name} @ ${item}\nAbility: ${ability}\nEVs: 252 SpA / 4 SpD / 252 Spe\n${nature} Nature\n${moves
          .map((m) => `- ${m}`)
          .join("\n")}\n`;
      })
      .join("\n");
  }, [activeTeam]);

  const exportMinecraftCommands = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    return activeTeam.pokemonList
      .map((p) => {
        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const nature = (p.customNature || "timid").toLowerCase();
        const moves = (p.customMoves || ["protect", "substitute", "tackle", "rest"])
          .map((m) => m.toLowerCase().replace(/\s+/g, ""))
          .join(",");

        return `/pokegive @p ${cleanName} level=50 nature=${nature} ivs=31,31,31,31,31,31 moves=${moves}`;
      })
      .join("\n");
  }, [activeTeam]);

  // Enlace codificado para abrir en el celular vía QR
  const qrCodeUrl = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    const teamPayload = encodeURIComponent(exportShowdownText);
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${teamPayload}`;
  }, [activeTeam, exportShowdownText]);

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
                <h2 className="text-xl font-bold text-white">
                  Team Builder & Gestor de Equipos
                </h2>
                <p className="text-xs text-zinc-400">
                  Importación Showdown, análisis de cobertura y transferencia móvil por QR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQrModalOpen(true)}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Móvil</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Showdown</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selector de Cajas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTeamId(t.id);
                    setIsEditingName(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 ${
                    t.id === activeTeamId
                      ? "bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20"
                      : "bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40">
                    {t.pokemonList.length}/6
                  </span>
                </button>
              ))}

              <button
                onClick={() => {
                  const newTeam: SavedTeam = {
                    id: "team-" + Date.now(),
                    name: `Equipo ${teams.length + 1}`,
                    pokemonList: [],
                  };
                  saveTeamsToStorage([...teams, newTeam]);
                  setActiveTeamId(newTeam.id);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>Nuevo Equipo</span>
              </button>
            </div>

            {activeTeam && (
              <div className="flex items-center gap-2 shrink-0">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="bg-zinc-950 border border-purple-500/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-36"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (!teamNameInput.trim()) return;
                        saveTeamsToStorage(
                          teams.map((t) =>
                            t.id === activeTeam.id ? { ...t, name: teamNameInput.trim() } : t
                          )
                        );
                        setIsEditingName(false);
                      }}
                      className="p-1 rounded bg-purple-500 text-white"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grilla 6 Pokémon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Integrantes del Equipo ({activeTeam?.pokemonList.length || 0}/6):
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
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar en la Dex..."
                            autoFocus
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {availablePokemon.map((p) => (
                            <button
                              key={p.id + "-" + p.name}
                              onClick={() => handleAddPokemon(p)}
                              className="w-full p-2 rounded-xl flex items-center justify-between text-left hover:bg-white/[0.06] text-zinc-300 transition"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <img src={p.sprite} alt={p.name} className="w-7 h-7 object-contain" />
                                <span className="text-xs font-bold text-white truncate">{p.name}</span>
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
                    onClick={() => setEditingMember(member)}
                    className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/40 transition flex items-center justify-between gap-3 relative cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={member.sprite} alt={member.name} className="w-12 h-12 object-contain shrink-0 drop-shadow" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{member.name}</span>
                          <Sliders className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <span className="text-[9px] text-amber-300 font-mono block">@{member.customItem || "Leftovers"}</span>
                        <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block truncate">
                          {member.customMoves?.slice(0, 2).join(", ")}...
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePokemon(member.memberId);
                      }}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MATRIZ DE COBERTURA Y DEBILIDADES ELEMENTALES */}
          {coverageAnalysis && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Matriz Defensiva de Tipos (18 Tipos)
                </span>
                {coverageAnalysis.highVulnerabilities.length > 0 && (
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {coverageAnalysis.highVulnerabilities.length} debilidades compartidas (≥3)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5 text-center">
                {ALL_TYPES.map((t) => {
                  const data = coverageAnalysis.analysis[t];
                  const isHighWeak = data.weak >= 3;
                  return (
                    <div
                      key={t}
                      className={`p-2 rounded-xl border transition ${
                        isHighWeak
                          ? "bg-rose-500/20 border-rose-500/50"
                          : data.resist > data.weak
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-zinc-950 border-white/5"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-zinc-300 block truncate">
                        {t}
                      </span>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] font-mono">
                        <span className={data.weak > 0 ? "text-rose-400 font-bold" : "text-zinc-600"}>
                          -{data.weak}
                        </span>
                        <span className={data.resist > 0 ? "text-emerald-400 font-bold" : "text-zinc-600"}>
                          +{data.resist + data.immune}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exportaciones Showdown & /pokegive */}
          {activeTeam && activeTeam.pokemonList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Formato Showdown
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportShowdownText);
                      setCopiedShowdown(true);
                      setTimeout(() => setCopiedShowdown(false), 2000);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      copiedShowdown
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {copiedShowdown ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedShowdown ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl max-h-24 overflow-y-auto custom-scrollbar border border-white/5">
                  {exportShowdownText}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    Comandos /pokegive (Minecraft)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportMinecraftCommands);
                      setCopiedCommands(true);
                      setTimeout(() => setCopiedCommands(false), 2000);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      copiedCommands
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {copiedCommands ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCommands ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl max-h-24 overflow-y-auto custom-scrollbar border border-white/5">
                  {exportMinecraftCommands}
                </pre>
              </div>
            </div>
          )}

          {/* MODAL QR MÓVIL FUNCIONAL */}
          <AnimatePresence>
            {isQrModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsQrModalOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-sm bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 space-y-4 text-center"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white">Transferir a Celular</h3>
                    <button onClick={() => setIsQrModalOpen(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
                    <img src={qrCodeUrl} alt="QR Team" className="w-56 h-56 object-contain" />
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Escanea este código con la cámara de tu celular para abrir el formato Showdown de tu equipo al instante.
                  </p>

                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                  >
                    Cerrar
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal de Importar Showdown */}
          <AnimatePresence>
            {isImportModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsImportModalOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">Importar Formato Showdown</h3>
                    </div>
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={8}
                    placeholder={`Garchomp @ Life Orb\nAbility: Rough Skin\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Earthquake\n- Outrage\n- Swords Dance\n- Protect`}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-400"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportShowdown}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition"
                    >
                      Cargar en Equipo
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal Edición de Pokémon */}
          <AnimatePresence>
            {editingMember && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingMember(null)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={editingMember.sprite} alt={editingMember.name} className="w-10 h-10 object-contain" />
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Personalizar {editingMember.name}
                        </h3>
                        <span className="text-[10px] text-zinc-400">
                          Ajusta objeto, naturaleza y los 4 ataques
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setEditingMember(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Objeto:</span>
                      <select
                        value={editingMember.customItem || "Leftovers"}
                        onChange={(e) => setEditingMember({ ...editingMember, customItem: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                      >
                        {COMMON_ITEMS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Naturaleza:</span>
                      <select
                        value={editingMember.customNature || "Timid"}
                        onChange={(e) => setEditingMember({ ...editingMember, customNature: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                      >
                        {COMMON_NATURES.map((nat) => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Moveset (4 Ataques):</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((moveIdx) => {
                        const moves = editingMember.customMoves || ["Protect", "Substitute", "Tackle", "Rest"];
                        return (
                          <input
                            key={moveIdx}
                            type="text"
                            value={moves[moveIdx]}
                            onChange={(e) => {
                              const newMoves = [...moves] as [string, string, string, string];
                              newMoves[moveIdx] = e.target.value;
                              setEditingMember({ ...editingMember, customMoves: newMoves });
                            }}
                            placeholder={`Movimiento #${moveIdx + 1}`}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingMember(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveMemberCustomization(editingMember)}
                      className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-xs text-white font-bold transition shadow-lg shadow-purple-500/20"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
