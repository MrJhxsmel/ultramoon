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
  Link,
  Sparkles,
  Wand2,
  Image as ImageIcon,
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

const COMPETITIVE_PRESETS: Record<string, { item: string; nature: string; moves: [string, string, string, string] }> = {
  garchomp: { item: "Life Orb", nature: "Jolly", moves: ["Earthquake", "Dragon Claw", "Swords Dance", "Protect"] },
  toxapex: { item: "Leftovers", nature: "Bold", moves: ["Scald", "Toxic", "Recover", "Haze"] },
  lucario: { item: "Focus Sash", nature: "Jolly", moves: ["Close Combat", "Meteor Mash", "Extreme Speed", "Swords Dance"] },
  charizard: { item: "Choice Specs", nature: "Timid", moves: ["Flamethrower", "Air Slash", "Overheat", "Focus Blast"] },
  venusaur: { item: "Life Orb", nature: "Modest", moves: ["Giga Drain", "Sludge Bomb", "Earth Power", "Sleep Powder"] },
  blastoise: { item: "White Herb", nature: "Modest", moves: ["Shell Smash", "Hydro Pump", "Ice Beam", "Aura Sphere"] },
  tyranitar: { item: "Choice Band", nature: "Adamant", moves: ["Stone Edge", "Crunch", "Earthquake", "Ice Punch"] },
  dragapult: { item: "Choice Scarf", nature: "Timid", moves: ["Draco Meteor", "Shadow Ball", "U-turn", "Flamethrower"] },
};

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedToastMessage, setSharedToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let currentTeams: SavedTeam[] = DEFAULT_TEAMS;
    const saved = localStorage.getItem("ultramoon_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) currentTeams = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTeam = params.get("team");
      if (urlTeam) {
        try {
          const decoded = decodeURIComponent(escape(atob(urlTeam)));
          const parsedMembers = parseShowdown(decoded);

          if (parsedMembers.length > 0) {
            const newTeamId = "team-shared-" + Date.now();
            const newTeam: SavedTeam = {
              id: newTeamId,
              name: `Equipo Compartido`,
              pokemonList: parsedMembers,
            };

            const updated = [newTeam, ...currentTeams];
            setTeams(updated);
            setActiveTeamId(newTeamId);
            localStorage.setItem("ultramoon_teams", JSON.stringify(updated));

            setSharedToastMessage(`¡Equipo de ${parsedMembers.length} Pokémon recibido con éxito!`);
            setTimeout(() => setSharedToastMessage(null), 5000);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setTeams(currentTeams);
    setActiveTeamId(currentTeams[0].id);
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
    const cleanKey = pokemon.name.toLowerCase();
    const preset = COMPETITIVE_PRESETS[cleanKey];

    const newMember: TeamMember = {
      ...pokemon,
      memberId: "m-" + Date.now() + Math.random(),
      customItem: preset?.item || "Leftovers",
      customNature: preset?.nature || "Timid",
      customMoves: preset?.moves || ["Protect", "Substitute", "Tackle", "Rest"],
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

  const handleApplyPreset = (pokemonName: string) => {
    if (!editingMember) return;
    const cleanKey = pokemonName.toLowerCase();
    const preset = COMPETITIVE_PRESETS[cleanKey];
    if (preset) {
      setEditingMember({
        ...editingMember,
        customItem: preset.item,
        customNature: preset.nature,
        customMoves: preset.moves,
      });
    } else {
      setEditingMember({
        ...editingMember,
        customItem: "Life Orb",
        customNature: "Jolly",
        customMoves: ["Protect", "Earthquake", "Substitute", "Rest"],
      });
    }
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

  function parseShowdown(rawText: string): TeamMember[] {
    const blocks = rawText.trim().split(/\n\s*\n/);
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

    return newMembers;
  }

  const handleManualImport = () => {
    const parsed = parseShowdown(importText);
    if (parsed.length > 0) {
      const newTeamId = "team-" + Date.now();
      const newTeam: SavedTeam = {
        id: newTeamId,
        name: `Equipo Importado ${teams.length + 1}`,
        pokemonList: parsed,
      };
      const updated = [...teams, newTeam];
      saveTeamsToStorage(updated);
      setActiveTeamId(newTeamId);
      setIsImportModalOpen(false);
      setImportText("");
      setSharedToastMessage(`¡Equipo importado con éxito!`);
      setTimeout(() => setSharedToastMessage(null), 4000);
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

  const shareableUrl = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0 || typeof window === "undefined") return "";
    const b64 = btoa(unescape(encodeURIComponent(exportShowdownText)));
    return `${window.location.origin}/?team=${b64}`;
  }, [activeTeam, exportShowdownText]);

  const qrCodeUrl = useMemo(() => {
    if (!shareableUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(shareableUrl)}`;
  }, [shareableUrl]);

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generador de Tarjeta de Equipo PNG nativo con Canvas
  const handleDownloadTeamCard = () => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo Cyber Dark
    ctx.fillStyle = "#090b10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decoración
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, "rgba(147, 51, 234, 0.2)");
    grad.addColorStop(1, "rgba(6, 182, 212, 0.1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(`Ultramoon Cobblemon | ${activeTeam.name}`, 50, 65);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px sans-serif";
    ctx.fillText("Composición Competitiva VGC / Cobblemon Gen 9", 50, 95);

    // Tarjetas de los 6 Pokémon
    activeTeam.pokemonList.forEach((member, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 50 + col * 370;
      const y = 130 + row * 225;

      // Caja individual
      ctx.fillStyle = "#12151f";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, 350, 205, 16);
      ctx.fill();
      ctx.stroke();

      // Textos
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(member.name, x + 20, y + 40);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "14px monospace";
      ctx.fillText(`@${member.customItem || "Leftovers"}`, x + 20, y + 65);

      ctx.fillStyle = "#a855f7";
      ctx.font = "13px sans-serif";
      ctx.fillText(`Nat: ${member.customNature || "Timid"}`, x + 20, y + 90);

      // Movimientos
      ctx.fillStyle = "#d1d5db";
      ctx.font = "12px monospace";
      const moves = member.customMoves || ["Protect", "Substitute", "Tackle", "Rest"];
      moves.forEach((m, mIdx) => {
        ctx.fillText(`• ${m}`, x + 20, y + 120 + mIdx * 18);
      });
    });

    const link = document.createElement("a");
    link.download = `${activeTeam.name.toLowerCase().replace(/\s+/g, "-")}-team.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
                <h2 className="text-xl font-bold text-white">
                  Team Builder & Gestor de Equipos
                </h2>
                <p className="text-xs text-zinc-400">
                  Presets Smogon, descarga en PNG, enlace compartible y QR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTeamCard}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold text-purple-300 transition flex items-center gap-1.5 disabled:opacity-40"
                title="Descargar ficha del equipo en imagen PNG"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar PNG</span>
              </button>

              <button
                onClick={handleCopyLink}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40 ${
                  copiedLink
                    ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5 text-purple-400" />}
                <span>{copiedLink ? "¡Copiado!" : "Compartir Enlace"}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar</span>
              </button>

              <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast */}
          {sharedToastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-zinc-900 border border-purple-500/40 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white">{sharedToastMessage}</span>
              </div>
              <button onClick={() => setSharedToastMessage(null)} className="text-zinc-400 hover:text-white text-xs px-2">
                ✕
              </button>
            </motion.div>
          )}

          {/* Cajas y Equipos */}
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
                <span>Nuevo</span>
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
                  <button onClick={() => setIsEditingName(true)} className="p-1.5 rounded-lg bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white text-xs">
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {teams.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = teams.filter((t) => t.id !== activeTeam.id);
                      saveTeamsToStorage(updated);
                      setActiveTeamId(updated[0].id);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Slots 6 Pokémon */}
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

          {/* Matriz Defensiva */}
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
                      <span className="text-[10px] uppercase font-bold text-zinc-300 block truncate">{t}</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] font-mono">
                        <span className={data.weak > 0 ? "text-rose-400 font-bold" : "text-zinc-600"}>-{data.weak}</span>
                        <span className={data.resist > 0 ? "text-emerald-400 font-bold" : "text-zinc-600"}>+{data.resist + data.immune}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exportaciones */}
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
                      copiedShowdown ? "bg-emerald-500 text-black font-bold" : "bg-white/10 text-white hover:bg-white/20"
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
                      copiedCommands ? "bg-emerald-500 text-black font-bold" : "bg-white/10 text-white hover:bg-white/20"
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

          {/* Modal Edición de Pokémon con Presets */}
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
                  exit={{ opacity: 0, scale: 1 }}
                  className="relative w-full max-w-lg bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={editingMember.sprite} alt={editingMember.name} className="w-10 h-10 object-contain" />
                      <div>
                        <h3 className="text-base font-bold text-white">Personalizar {editingMember.name}</h3>
                        <span className="text-[10px] text-zinc-400">Ajusta objeto, naturaleza y los 4 ataques</span>
                      </div>
                    </div>
                    <button onClick={() => setEditingMember(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">Preset Competitivo Recomendado</span>
                        <span className="text-[10px] text-zinc-400">Carga el set óptimo Smogon/VGC con 1 clic</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyPreset(editingMember.name)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-md shadow-purple-600/30"
                    >
                      Cargar Set
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

          {/* Modal QR */}
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
                  exit={{ opacity: 0, scale: 1 }}
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
                    Escanea este código con tu cámara para cargar tu equipo en el celular con un solo clic.
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
                  exit={{ opacity: 0, scale: 1 }}
                  className="relative w-full max-w-lg bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl z-50 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">Importar Formato Showdown</h3>
                    </div>
                    <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
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
                      onClick={handleManualImport}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition"
                    >
                      Cargar en Equipo
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
