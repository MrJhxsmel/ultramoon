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

const TYPE_CANVAS_COLORS: Record<string, string> = {
  Normal: "#94a3b8", Fire: "#f97316", Water: "#38bdf8", Grass: "#22c55e",
  Electric: "#facc15", Ice: "#67e8f9", Fighting: "#ef4444", Poison: "#a855f7",
  Ground: "#ca8a04", Flying: "#818cf8", Psychic: "#ec4899", Bug: "#84cc16",
  Rock: "#a16207", Ghost: "#7e22ce", Dragon: "#6366f1", Steel: "#64748b",
  Dark: "#475569", Fairy: "#f472b6",
};

export function TeamBuilderModal({ isOpen, onClose }: TeamBuilderModalProps) {
  const [teams, setTeams] = useState<SavedTeam[]>([
    { id: "default-team-1", name: "Equipo Principal VGC", pokemonList: [] },
  ]);
  const [activeTeamId, setActiveTeamId] = useState<string>("default-team-1");
  const [storageBox, setStorageBox] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<"team" | "pc">("team");
  const [matrixTab, setMatrixTab] = useState<"defense" | "offense" | "synergy">("defense");

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

  useEffect(() => {
    let currentTeams: SavedTeam[] = [
      { id: "default-team-1", name: "Equipo Principal VGC", pokemonList: [] },
    ];
    const saved = localStorage.getItem("ultramoon_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) currentTeams = parsed;
      } catch (e) {}
    }

    const savedPc = localStorage.getItem("ultramoon_pc_box");
    if (savedPc) {
      try {
        const parsedPc = JSON.parse(savedPc);
        if (Array.isArray(parsedPc)) setStorageBox(parsedPc);
      } catch (e) {}
    }

    setTeams(currentTeams);
    setActiveTeamId(currentTeams[0].id);
  }, []);

  const saveTeamsToStorage = (updatedTeams: SavedTeam[]) => {
    setTeams(updatedTeams);
    localStorage.setItem("ultramoon_teams", JSON.stringify(updatedTeams));
  };

  const savePcToStorage = (updatedPc: TeamMember[]) => {
    setStorageBox(updatedPc);
    localStorage.setItem("ultramoon_pc_box", JSON.stringify(updatedPc));
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

  // Detector de Cores y Sinergias
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

    return {
      hasFwg,
      hasDsf,
      hasFire,
      hasWater,
      hasGrass,
      hasDragon,
      hasSteel,
      hasFairy,
      hasGround,
      recommendations,
    };
  }, [activeTeam]);

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
        const cap = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
        teamStabTypes.add(cap);
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

  const handleAddPokemon = (pokemon: PokemonData) => {
    const cleanKey = pokemon.name.toLowerCase();
    const preset = COMPETITIVE_PRESETS[cleanKey];

    const newMember: TeamMember = {
      ...pokemon,
      memberId: "m-" + Date.now() + Math.random(),
      customItem: preset?.item || "Leftovers",
      customNature: preset?.nature || "Timid",
      customMoves: preset?.moves || ["Protect", "Substitute", "Tackle", "Rest"],
    };

    if (activeTab === "pc") {
      savePcToStorage([...storageBox, newMember]);
    } else {
      if (!activeTeam || activeTeam.pokemonList.length >= 6) return;
      const updated = teams.map((t) => {
        if (t.id === activeTeam.id) return { ...t, pokemonList: [...t.pokemonList, newMember] };
        return t;
      });
      saveTeamsToStorage(updated);
    }

    setIsPickerOpen(false);
    setSearchQuery("");
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

  const handleMovePcToTeam = (member: TeamMember) => {
    if (!activeTeam || activeTeam.pokemonList.length >= 6) return;
    savePcToStorage(storageBox.filter((m) => m.memberId !== member.memberId));
    const updated = teams.map((t) => {
      if (t.id === activeTeam.id) return { ...t, pokemonList: [...t.pokemonList, member] };
      return t;
    });
    saveTeamsToStorage(updated);
  };

  const handleMoveTeamToPc = (member: TeamMember) => {
    handleRemovePokemon(member.memberId);
    savePcToStorage([...storageBox, member]);
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

  const handleSaveMemberCustomization = (updatedMember: TeamMember) => {
    if (activeTab === "pc") {
      savePcToStorage(storageBox.map((m) => (m.memberId === updatedMember.memberId ? updatedMember : m)));
    } else if (activeTeam) {
      const updated = teams.map((t) => {
        if (t.id === activeTeam.id) {
          return {
            ...t,
            pokemonList: t.pokemonList.map((m) => (m.memberId === updatedMember.memberId ? updatedMember : m)),
          };
        }
        return t;
      });
      saveTeamsToStorage(updated);
    }
    setEditingMember(null);
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

  // Exportador PNG
  const handleDownloadTeamCard = async () => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#07090e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow1 = ctx.createRadialGradient(200, 100, 10, 200, 100, 450);
    glow1.addColorStop(0, "rgba(168, 85, 247, 0.25)");
    glow1.addColorStop(1, "rgba(7, 9, 14, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow2 = ctx.createRadialGradient(1080, 600, 10, 1080, 600, 500);
    glow2.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    glow2.addColorStop(1, "rgba(7, 9, 14, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 32px sans-serif";
    ctx.fillText(activeTeam.name, 50, 75);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 14px sans-serif";
    ctx.fillText("Ultramoon Competitive Suite • Formato 6v6 VGC / Cobblemon", 50, 105);

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
        img.src = url;
      });
    };

    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 50 + col * 393;
      const y = 135 + row * 260;
      const cardW = 373;
      const cardH = 245;

      const member = activeTeam.pokemonList[i];

      if (!member) {
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.font = "600 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`Slot #${i + 1} Vacío`, x + cardW / 2, y + cardH / 2);
        ctx.restore();
        continue;
      }

      ctx.fillStyle = "#0f131d";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      try {
        const spriteImg = await loadImage(member.sprite);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spriteImg, x + 16, y + 16, 84, 84);
      } catch (err) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("✦", x + 50, y + 68);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 19px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(member.name, x + 115, y + 42);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`@${member.customItem || "Leftovers"}`, x + 115, y + 64);

      ctx.fillStyle = "#a855f7";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`Nat: ${member.customNature || "Timid"}`, x + 115, y + 83);

      const moves = member.customMoves || ["Protect", "Substitute", "Tackle", "Rest"];
      moves.forEach((move, mIdx) => {
        const mCol = mIdx % 2;
        const mRow = Math.floor(mIdx / 2);
        const mX = x + 16 + mCol * 174;
        const mY = y + 130 + mRow * 48;

        ctx.fillStyle = "#161b26";
        ctx.beginPath();
        ctx.roundRect(mX, mY, 166, 40, 10);
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("▸", mX + 8, mY + 24);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "600 12px sans-serif";
        const trimmedMove = move.length > 17 ? move.slice(0, 16) + "…" : move;
        ctx.fillText(trimmedMove, mX + 22, mY + 24);
      });
    }

    const link = document.createElement("a");
    link.download = `${activeTeam.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-team.png`;
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
                <h2 className="text-xl font-bold text-white">Team Builder & Caja PC</h2>
                <p className="text-xs text-zinc-400">
                  Gestión 6v6, sinergias FWG / DSF, caja de suplentes y descarga en PNG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTeamCard}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold text-purple-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PNG</span>
              </button>

              <button
                onClick={() => {
                  if (!shareableUrl) return;
                  navigator.clipboard.writeText(shareableUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5 text-purple-400" />}
                <span>{copiedLink ? "¡Copiado!" : "Compartir"}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>

              <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Pestañas: Equipo vs Caja PC */}
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
              onClick={() => setActiveTab("pc")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "pc" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Caja PC / Suplentes ({storageBox.length})</span>
            </button>
          </div>

          {/* VISTA 1: EQUIPO TITULAR */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Slots de Batalla (6 Pokémon):
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
                            {availablePokemon.map((p) => (
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
                      onClick={() => setEditingMember(member)}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/40 transition flex items-center justify-between gap-3 relative cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={member.sprite} alt={member.name} className="w-12 h-12 object-contain shrink-0 drop-shadow" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">{member.name}</span>
                          <span className="text-[9px] text-amber-300 font-mono block">@{member.customItem || "Leftovers"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveTeamToPc(member);
                          }}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                          title="Enviar a Caja PC (Guardar suplente)"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePokemon(member.memberId);
                          }}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 2: CAJA PC / STORAGE BOX */}
          {activeTab === "pc" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Pokémon en Caja de Reserva ({storageBox.length}):
                </span>

                <button
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar en PC</span>
                </button>
              </div>

              {storageBox.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs space-y-1">
                  <Archive className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                  <p>Tu Caja PC está vacía.</p>
                  <p className="text-[11px] text-zinc-600">
                    Guarda aquí Pokémon suplentes para intercambiarlos con tu equipo titular en cualquier momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {storageBox.map((member) => (
                    <div
                      key={member.memberId}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={member.sprite} alt={member.name} className="w-10 h-10 object-contain shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">{member.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">@{member.customItem || "Leftovers"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleMovePcToTeam(member)}
                        disabled={activeTeam && activeTeam.pokemonList.length >= 6}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                        title="Subir al equipo titular"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Al Equipo</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MATRIZ TÁCTICA & CORES DE SINERGIA */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setMatrixTab("defense")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "defense" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Defensa (Debilidades)
              </button>
              <button
                onClick={() => setMatrixTab("offense")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "offense" ? "bg-cyan-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Ataque (Puntos Ciegos)
              </button>
              <button
                onClick={() => setMatrixTab("synergy")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  matrixTab === "synergy" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Cores & Sinergias Meta
              </button>
            </div>

            {/* PESTAÑA: SINERGIAS Y CORES */}
            {matrixTab === "synergy" && synergyData && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${synergyData.hasFwg ? "bg-emerald-500/15 border-emerald-500/30" : "bg-zinc-950 border-white/5"}`}>
                    <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Núcleo FWG (Fuego / Agua / Planta)
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      {synergyData.hasFwg
                        ? "✓ Núcleo completo activo: excelente balance elemental defensivo y ofensivo."
                        : "Incompleto. Falta balancear con coberturas de Fuego, Agua o Planta."}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${synergyData.hasDsf ? "bg-purple-500/15 border-purple-500/30" : "bg-zinc-950 border-white/5"}`}>
                    <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Núcleo DSF (Dragón / Acero / Hada)
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      {synergyData.hasDsf
                        ? "✓ Núcleo DSF activo: la tríada defensiva más sólida del formato competitivo."
                        : "Incompleto. Añadir un Acero o Hada otorgará inmunidades críticas."}
                    </p>
                  </div>
                </div>

                {synergyData.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Sugerencias de Pokémon para cubrir huecos:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {synergyData.recommendations.map((rec, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 font-mono text-[11px]">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Matriz Defensiva */}
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

            {/* Matriz Ofensiva */}
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
          </div>

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
                    {copiedShowdown ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-purple-400" />}
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
                    {copiedCommands ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-amber-400" />}
                    {copiedCommands ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl max-h-24 overflow-y-auto custom-scrollbar border border-white/5">
                  {exportMinecraftCommands}
                </pre>
              </div>
            </div>
          )}

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
                        <span className="text-xs font-bold text-white block">Preset Competitivo</span>
                        <span className="text-[10px] text-zinc-400">Carga el set meta con 1 clic</span>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
