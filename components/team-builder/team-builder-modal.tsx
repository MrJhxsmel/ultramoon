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
  Download,
  Upload,
  Sliders,
  QrCode,
  Smartphone,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
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

const COMMON_ITEMS = [
  "Leftovers",
  "Life Orb",
  "Focus Sash",
  "Assault Vest",
  "Choice Band",
  "Choice Specs",
  "Choice Scarf",
  "Heavy-Duty Boots",
  "Rocky Helmet",
  "Eviolite",
  "Sitrus Berry",
];

const COMMON_NATURES = [
  "Timid",
  "Jolly",
  "Modest",
  "Adamant",
  "Bold",
  "Calm",
  "Impish",
  "Careful",
  "Brave",
  "Quiet",
];

const DEFAULT_TEAMS: SavedTeam[] = [
  {
    id: "default-team-1",
    name: "Equipo Principal VGC",
    pokemonList: [
      {
        ...SAMPLE_POKEMON[0],
        memberId: "m-1",
        customItem: "Leftovers",
        customNature: "Modest",
        customMoves: ["Giga Drain", "Sludge Bomb", "Sleep Powder", "Protect"],
      },
      {
        ...SAMPLE_POKEMON[3],
        memberId: "m-2",
        customItem: "Life Orb",
        customNature: "Timid",
        customMoves: ["Flamethrower", "Air Slash", "Dragon Pulse", "Protect"],
      },
      {
        ...SAMPLE_POKEMON[6],
        memberId: "m-3",
        customItem: "Assault Vest",
        customNature: "Modest",
        customMoves: ["Hydro Pump", "Ice Beam", "Flash Cannon", "Aura Sphere"],
      },
    ],
  },
];

export function TeamBuilderModal({ isOpen, onClose }: TeamBuilderModalProps) {
  const [teams, setTeams] = useState<SavedTeam[]>(DEFAULT_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<string>("default-team-1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");

  // Editor detallado de un integrante
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Selector de nuevos integrantes
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visor de Código QR
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Estados de confirmación de copia
  const [copiedShowdown, setCopiedShowdown] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  // Cargar desde localStorage
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
        console.error("Error al cargar equipos", e);
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
    if (activeTeam) {
      setTeamNameInput(activeTeam.name);
    }
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
    if (!searchQuery.trim()) return SAMPLE_POKEMON.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 20);
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

  const handleCreateNewTeam = () => {
    const newTeam: SavedTeam = {
      id: "team-" + Date.now(),
      name: `Equipo ${teams.length + 1}`,
      pokemonList: [],
    };
    const updated = [...teams, newTeam];
    saveTeamsToStorage(updated);
    setActiveTeamId(newTeam.id);
  };

  const handleDeleteTeam = (id: string) => {
    if (teams.length <= 1) return;
    const updated = teams.filter((t) => t.id !== id);
    saveTeamsToStorage(updated);
    setActiveTeamId(updated[0].id);
  };

  const handleSaveTeamName = () => {
    if (!teamNameInput.trim() || !activeTeam) return;
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) {
        return { ...t, name: teamNameInput.trim() };
      }
      return t;
    });
    saveTeamsToStorage(updated);
    setIsEditingName(false);
  };

  // Exportar / Importar JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(teams, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ultramoon_teams_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveTeamsToStorage(parsed);
          setActiveTeamId(parsed[0].id);
        }
      } catch (err) {
        alert("El archivo no tiene un formato válido de Ultramoon.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Exportación Showdown
  const exportShowdownText = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    return activeTeam.pokemonList
      .map((p) => {
        const item = p.customItem || "Leftovers";
        const nature = p.customNature || "Timid";
        const ability = p.abilities?.primary || "Overgrow";
        const moves = p.customMoves || [
          "Protect",
          "Substitute",
          "Flamethrower",
          "Thunderbolt",
        ];

        return `${p.name} @ ${item}\nAbility: ${ability}\nEVs: 252 SpA / 4 SpD / 252 Spe\n${nature} Nature\n${moves
          .map((m) => `- ${m}`)
          .join("\n")}\n`;
      })
      .join("\n");
  }, [activeTeam]);

  // Exportación comandos Minecraft
  const exportMinecraftCommands = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    return activeTeam.pokemonList
      .map((p) => {
        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const nature = (p.customNature || "timid").toLowerCase();
        const moves = (
          p.customMoves || ["protect", "substitute", "flamethrower", "thunderbolt"]
        )
          .map((m) => m.toLowerCase().replace(/\s+/g, ""))
          .join(",");

        return `/pokegive @p ${cleanName} level=50 nature=${nature} ivs=31,31,31,31,31,31 moves=${moves}`;
      })
      .join("\n");
  }, [activeTeam]);

  // URL del Código QR con los datos del equipo para abrir en el móvil
  const qrCodeUrl = useMemo(() => {
    if (!activeTeam) return "";
    const summary = activeTeam.pokemonList
      .map(
        (p) =>
          `${p.name} (${p.customItem || "Sin Objeto"}) - [${(
            p.customMoves || []
          ).join(", ")}]`
      )
      .join("\n");
    const content = `Ultramoon - ${activeTeam.name}:\n\n${summary}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      content
    )}`;
  }, [activeTeam]);

  const handleCopyShowdown = () => {
    if (!exportShowdownText) return;
    navigator.clipboard.writeText(exportShowdownText);
    setCopiedShowdown(true);
    setTimeout(() => setCopiedShowdown(false), 2000);
  };

  const handleCopyCommands = () => {
    if (!exportMinecraftCommands) return;
    navigator.clipboard.writeText(exportMinecraftCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
                  Team Builder & Gestor de Equipos
                </h2>
                <p className="text-xs text-zinc-400">
                  Configura ataques, objetos y exporta a Showdown, Minecraft o Móvil
                </p>
              </div>
            </div>

            {/* Acciones del encabezado */}
            <div className="flex items-center gap-2">
              {activeTeam && activeTeam.pokemonList.length > 0 && (
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 transition flex items-center gap-1.5"
                  title="Ver código QR para móvil"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">QR Móvil</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition flex items-center gap-1.5"
                title="Cargar copia de respaldo JSON"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Restaurar</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition flex items-center gap-1.5"
                title="Guardar copia de respaldo JSON"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Copia JSON</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SELECTOR DE CAJAS / EQUIPOS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
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
                      : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                    {t.pokemonList.length}/6
                  </span>
                </button>
              ))}

              <button
                onClick={handleCreateNewTeam}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>Nuevo Equipo</span>
              </button>
            </div>

            {/* Renombrar o Eliminar */}
            {activeTeam && (
              <div className="flex items-center gap-2 shrink-0">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="bg-zinc-900 border border-purple-500/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-36"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTeamName}
                      className="p-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white text-xs flex items-center gap-1"
                    title="Renombrar este equipo"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {teams.length > 1 && (
                  <button
                    onClick={() => handleDeleteTeam(activeTeam.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs"
                    title="Eliminar este equipo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SLOTS DE LOS 6 POKÉMON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Integrantes del Equipo ({activeTeam?.pokemonList.length || 0}/6) •{" "}
                <span className="text-purple-400 font-normal">
                  Haz clic en una tarjeta para editar su set
                </span>
                :
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
                        className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                      >
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar especie..."
                            autoFocus
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {availablePokemon.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleAddPokemon(p)}
                              className="w-full p-2 rounded-xl flex items-center justify-between text-left hover:bg-white/[0.06] text-zinc-300 transition"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <img
                                  src={p.sprite}
                                  alt={p.name}
                                  className="w-7 h-7 object-contain"
                                />
                                <span className="text-xs font-bold text-white truncate">
                                  {p.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                #{p.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Grid 6 Slots */}
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
                      <span className="text-[10px] text-zinc-600">Vacío</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={member.memberId}
                    onClick={() => setEditingMember(member)}
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/40 transition flex items-center justify-between gap-3 relative cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.sprite}
                        alt={member.name}
                        className="w-12 h-12 object-contain shrink-0 drop-shadow"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {member.name}
                          </span>
                          <Sliders className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          <span className="text-[9px] text-amber-300 font-mono">
                            @{member.customItem || "Leftovers"}
                          </span>
                        </div>
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
                      title="Quitar Pokémon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPORTACIONES */}
          {activeTeam && activeTeam.pokemonList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Formato Pokémon Showdown
                  </span>
                  <button
                    onClick={handleCopyShowdown}
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
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl max-h-28 overflow-y-auto custom-scrollbar border border-white/5">
                  {exportShowdownText}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    Comandos /pokegive (Minecraft)
                  </span>
                  <button
                    onClick={handleCopyCommands}
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
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl max-h-28 overflow-y-auto custom-scrollbar border border-white/5">
                  {exportMinecraftCommands}
                </pre>
              </div>
            </div>
          )}

          {/* SUB-MODAL 1: PERSONALIZACIÓN DEL INTEGRANTE */}
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
                      <img
                        src={editingMember.sprite}
                        alt={editingMember.name}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Personalizar {editingMember.name}
                        </h3>
                        <span className="text-[10px] text-zinc-400">
                          Ajusta objeto, naturaleza y los 4 ataques para exportación
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingMember(null)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Objeto Equipado:
                      </span>
                      <select
                        value={editingMember.customItem || "Leftovers"}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            customItem: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                      >
                        {COMMON_ITEMS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Naturaleza:
                      </span>
                      <select
                        value={editingMember.customNature || "Timid"}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            customNature: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                      >
                        {COMMON_NATURES.map((nat) => (
                          <option key={nat} value={nat}>
                            {nat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4 Ataques */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                      Moveset (4 Ataques):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((moveIdx) => {
                        const moves = editingMember.customMoves || [
                          "Protect",
                          "Substitute",
                          "Tackle",
                          "Rest",
                        ];
                        return (
                          <input
                            key={moveIdx}
                            type="text"
                            value={moves[moveIdx]}
                            onChange={(e) => {
                              const newMoves = [...moves] as [
                                string,
                                string,
                                string,
                                string
                              ];
                              newMoves[moveIdx] = e.target.value;
                              setEditingMember({
                                ...editingMember,
                                customMoves: newMoves,
                              });
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
                      onClick={() =>
                        handleSaveMemberCustomization(editingMember)
                      }
                      className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-xs text-white font-bold transition shadow-lg shadow-purple-500/20"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* SUB-MODAL 2: VISOR DE CÓDIGO QR PARA MÓVIL */}
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
                  className="relative w-full max-w-sm bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 text-left">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">
                        Llevar Equipo al Móvil
                      </span>
                    </div>
                    <button
                      onClick={() => setIsQrModalOpen(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Escanea este código con la cámara de tu teléfono para tener la ficha de ataques y objetos mientras juegas en la PC.
                  </p>

                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <img
                      src={qrCodeUrl}
                      alt="Código QR del Equipo"
                      className="w-52 h-52 object-contain"
                    />
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500">
                    {activeTeam?.name} • {activeTeam?.pokemonList.length} Pokémon
                  </span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
