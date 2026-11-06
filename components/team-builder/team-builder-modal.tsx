"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Link,
  MessageSquare,
  FileText,
  Target,
  AlertTriangle,
} from "lucide-react";
import POKEDEX_DATA from "@/data/cobblemon-pokedex.json";
import { PokemonData } from "@/types/pokemon";

interface TeamMember extends PokemonData {
  memberId: string;
  customItem?: string;
  customNature?: string;
  customMoves?: [string, string, string, string];
}

interface MatchupStrategy {
  id: string;
  rivalArchetype: string;
  recommendedLeads: string[];
  notes: string;
}

interface SavedTeam {
  id: string;
  name: string;
  pokemonList: TeamMember[];
  matchupStrategies?: MatchupStrategy[];
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

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-zinc-600/30 text-zinc-300 border-zinc-500/40",
  Fire: "bg-orange-500/30 text-orange-300 border-orange-500/40",
  Water: "bg-blue-500/30 text-blue-300 border-blue-500/40",
  Grass: "bg-emerald-500/30 text-emerald-300 border-emerald-500/40",
  Electric: "bg-amber-400/30 text-amber-300 border-amber-400/40",
  Ice: "bg-cyan-400/30 text-cyan-200 border-cyan-400/40",
  Fighting: "bg-red-600/30 text-red-300 border-red-600/40",
  Poison: "bg-purple-600/30 text-purple-300 border-purple-600/40",
  Ground: "bg-yellow-700/30 text-yellow-300 border-yellow-700/40",
  Flying: "bg-indigo-400/30 text-indigo-200 border-indigo-400/40",
  Psychic: "bg-pink-500/30 text-pink-300 border-pink-500/40",
  Bug: "bg-lime-500/30 text-lime-300 border-lime-500/40",
  Rock: "bg-amber-800/30 text-amber-200 border-amber-800/40",
  Ghost: "bg-violet-800/30 text-violet-300 border-violet-800/40",
  Dragon: "bg-indigo-700/30 text-indigo-300 border-indigo-700/40",
  Steel: "bg-slate-500/30 text-slate-300 border-slate-500/40",
  Dark: "bg-neutral-800/40 text-neutral-300 border-neutral-600/40",
  Fairy: "bg-rose-400/30 text-rose-300 border-rose-400/40",
};

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

const PRESET_ARCHETYPES = [
  { name: "Lluvia (Rain Team)", tip: "Denegar cambios de clima, cambiar con pivot resistente a agua y meter Campo de Hierba." },
  { name: "Sol (Sun Team)", tip: "Cuidar las entradas de tipo Fuego impulsado; responder con Roca, Tierra o cambio de clima." },
  { name: "Espacio Raro (Trick Room)", tip: "Usar Taunt (Mofa) o doble target sobre el colocador; protegerse en turnos clave." },
  { name: "Hiper Ofensivo (Hyper Offense)", tip: "Preservar muros prioritarios y castigar con prioridad (Golpe Bajo, Velocidad Extrema)." },
  { name: "Stall / Desgaste", tip: "Evitar estados alterados, usar Taunt contra recuperación pasiva y castigar con ataques de quiebre." },
];

export function TeamBuilderModal({ isOpen, onClose }: TeamBuilderModalProps) {
  const [teams, setTeams] = useState<SavedTeam[]>([
    {
      id: "default-team-1",
      name: "Equipo Competitivo VGC",
      pokemonList: [],
      matchupStrategies: [
        {
          id: "m-1",
          rivalArchetype: "Lluvia (Rain Team)",
          recommendedLeads: [],
          notes: "Denegar cambios de clima, cambiar con pivot resistente a agua y meter Campo de Hierba.",
        },
      ],
    },
  ]);
  const [activeTeamId, setActiveTeamId] = useState<string>("default-team-1");
  const [storageBox, setStorageBox] = useState<TeamMember[]>([]);
  const [mainView, setMainView] = useState<"builder" | "matchups" | "matrix" | "pc">("builder");

  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShowdown, setCopiedShowdown] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ultramoon_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTeams(parsed);
      } catch (e) {}
    }

    const savedPc = localStorage.getItem("ultramoon_pc_box");
    if (savedPc) {
      try {
        const parsedPc = JSON.parse(savedPc);
        if (Array.isArray(parsedPc)) setStorageBox(parsedPc);
      } catch (e) {}
    }
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

  // Manejo de Matchups
  const handleAddMatchup = (archetypeName: string, tip: string) => {
    if (!activeTeam) return;
    const newMatchup: MatchupStrategy = {
      id: "matchup-" + Date.now(),
      rivalArchetype: archetypeName,
      recommendedLeads: [],
      notes: tip,
    };
    const updatedList = [...(activeTeam.matchupStrategies || []), newMatchup];
    const updatedTeams = teams.map((t) => (t.id === activeTeam.id ? { ...t, matchupStrategies: updatedList } : t));
    saveTeamsToStorage(updatedTeams);
  };

  const handleUpdateMatchupNotes = (id: string, notes: string) => {
    if (!activeTeam) return;
    const updated = (activeTeam.matchupStrategies || []).map((m) => (m.id === id ? { ...m, notes } : m));
    const updatedTeams = teams.map((t) => (t.id === activeTeam.id ? { ...t, matchupStrategies: updated } : t));
    saveTeamsToStorage(updatedTeams);
  };

  const handleToggleLead = (matchupId: string, pokeName: string) => {
    if (!activeTeam) return;
    const updated = (activeTeam.matchupStrategies || []).map((m) => {
      if (m.id !== matchupId) return m;
      const exists = m.recommendedLeads.includes(pokeName);
      let newLeads = exists ? m.recommendedLeads.filter((n) => n !== pokeName) : [...m.recommendedLeads, pokeName];
      if (newLeads.length > 2) newLeads = newLeads.slice(1);
      return { ...m, recommendedLeads: newLeads };
    });
    const updatedTeams = teams.map((t) => (t.id === activeTeam.id ? { ...t, matchupStrategies: updated } : t));
    saveTeamsToStorage(updatedTeams);
  };

  const handleDeleteMatchup = (id: string) => {
    if (!activeTeam) return;
    const updated = (activeTeam.matchupStrategies || []).filter((m) => m.id !== id);
    const updatedTeams = teams.map((t) => (t.id === activeTeam.id ? { ...t, matchupStrategies: updated } : t));
    saveTeamsToStorage(updatedTeams);
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

    return { hasFwg, hasDsf, hasFire, hasWater, hasGrass, hasDragon, hasSteel, hasFairy, hasGround, recommendations };
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

    const criticalWeaknesses = Object.entries(analysis).filter(([_, data]) => data.weak >= 3);
    return { analysis, criticalWeaknesses };
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

  // Textos para exportar
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

  const exportDiscordMarkdown = useMemo(() => {
    if (!activeTeam || activeTeam.pokemonList.length === 0) return "";
    let md = `🏆 **${activeTeam.name.toUpperCase()}** — *Cobblemon Suite*\n`;
    md += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    activeTeam.pokemonList.forEach((p, idx) => {
      md += `**#${idx + 1} ${p.name}** @ \`${p.customItem || "Leftovers"}\`\n`;
      md += `▸ *Naturaleza:* ${p.customNature || "Timid"} | *Habilidad:* ${p.abilities?.primary || "Overgrow"}\n`;
      md += `▸ *Ataques:* ${(p.customMoves || ["Protect", "Substitute", "Tackle", "Rest"]).join(" • ")}\n\n`;
    });
    if (activeTeam.matchupStrategies && activeTeam.matchupStrategies.length > 0) {
      md += `📋 **Planes de Enfrentamiento (Matchups):**\n`;
      activeTeam.matchupStrategies.forEach((strat) => {
        md += `• **Vs ${strat.rivalArchetype}:** ${strat.notes}`;
        if (strat.recommendedLeads.length > 0) {
          md += ` (Leads: ${strat.recommendedLeads.join(" + ")})`;
        }
        md += `\n`;
      });
    }
    return md;
  }, [activeTeam]);

  // Motor Canvas PNG
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
      } catch (err) {}

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

    if (mainView === "pc") {
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
    if (mainView === "pc") {
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
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 space-y-6 custom-scrollbar"
        >
          {/* Header Superior y Controles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{activeTeam?.name}</h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeTeam?.pokemonList.length || 0}/6 Pokémon
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Tablero integral: armado 6v6, descarga en PNG, planes contra arquetipos meta y storage box
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTeamCard}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-semibold text-purple-300 transition flex items-center gap-1.5 disabled:opacity-40"
                title="Descargar imagen PNG del equipo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportDiscordMarkdown);
                  setCopiedDiscord(true);
                  setTimeout(() => setCopiedDiscord(false), 2000);
                }}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-40"
                title="Copiar formato con viñetas para Discord"
              >
                {copiedDiscord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedDiscord ? "¡Copiado!" : "Discord"}</span>
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
                <span className="hidden sm:inline">{copiedLink ? "¡Copiado!" : "Compartir"}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                disabled={!activeTeam || activeTeam.pokemonList.length === 0}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar">
            {[
              { id: "builder", label: "Alineación 6v6", icon: Users },
              { id: "matchups", label: "Planes de Enfrentamiento (Matchups)", icon: Target },
              { id: "matrix", label: "Balance & Puntos Ciegos", icon: ShieldCheck },
              { id: "pc", label: `Caja PC (${storageBox.length})`, icon: Archive },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mainView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMainView(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* PESTAÑA 1: CONSTRUCTOR 6v6 */}
          {mainView === "builder" && (
            <div className="space-y-6">
              {/* Cores Tácticos Destacados */}
              {synergyData && (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cores Activos:</span>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                        synergyData.hasFwg
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-zinc-950 text-zinc-500 border-white/5"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>Núcleo FWG (Fuego / Agua / Planta)</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                        synergyData.hasDsf
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                          : "bg-zinc-950 text-zinc-500 border-white/5"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Núcleo DSF (Dragón / Acero / Hada)</span>
                    </span>
                  </div>

                  {synergyData.recommendations.length > 0 && (
                    <span className="text-[11px] text-amber-300 font-medium">
                      Tip: Sugerido añadir {synergyData.recommendations[0]}
                    </span>
                  )}
                </div>
              )}

              {/* Botón Añadir Pokémon */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Miembros Titulares:
                </span>

                {activeTeam && activeTeam.pokemonList.length < 6 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir a la alineación</span>
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
                            placeholder="Buscar especie..."
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

              {/* Tarjetas 6v6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const member = activeTeam?.pokemonList[idx];

                  if (!member) {
                    return (
                      <div
                        key={idx}
                        onClick={() => setIsPickerOpen(true)}
                        className="h-36 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/40 bg-zinc-900/20 hover:bg-zinc-900/40 transition flex flex-col items-center justify-center text-zinc-500 hover:text-purple-300 cursor-pointer gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">Slot #{idx + 1} Libre</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={member.memberId}
                      onClick={() => setEditingMember(member)}
                      className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img src={member.sprite} alt={member.name} className="w-14 h-14 object-contain drop-shadow" />
                          <div>
                            <h4 className="text-sm font-bold text-white capitalize">{member.name}</h4>
                            <span className="text-[10px] text-amber-300 font-mono block">@{member.customItem || "Leftovers"}</span>
                            <div className="flex gap-1 mt-1">
                              {member.types.map((t) => (
                                <span
                                  key={t}
                                  className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                                    TYPE_COLORS[t] || "bg-zinc-800 text-zinc-300"
                                  }`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTeamToPc(member);
                            }}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                            title="Enviar a Caja PC"
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

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                        <span>Nat: {member.customNature || "Timid"}</span>
                        <span className="truncate max-w-[120px]">{member.customMoves?.[0] || "Protect"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exportadores de Código */}
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
                        Comandos /pokegive
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
            </div>
          )}

          {/* PESTAÑA 2: MATCHUPS */}
          {mainView === "matchups" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2.5">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Añadir plan contra amenaza común del servidor:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ARCHETYPES.map((arch) => (
                    <button
                      key={arch.name}
                      onClick={() => handleAddMatchup(arch.name, arch.tip)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-400" />
                      <span>{arch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(!activeTeam?.matchupStrategies || activeTeam.matchupStrategies.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs space-y-2">
                  <Target className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="font-semibold text-zinc-300">No hay planes de matchup guardados para este equipo.</p>
                  <p>Haz clic en los botones de arriba para planear tu respuesta contra lluvia, sol o stall.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTeam.matchupStrategies.map((strat) => (
                    <div
                      key={strat.id}
                      className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span>{strat.rivalArchetype}</span>
                          </h4>
                          <button
                            onClick={() => handleDeleteMatchup(strat.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                            Tus 2 Leads recomendados al inicio:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeTeam.pokemonList.map((p) => {
                              const isSelected = strat.recommendedLeads.includes(p.name);
                              return (
                                <button
                                  key={p.name}
                                  onClick={() => handleToggleLead(strat.id, p.name)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    isSelected
                                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                      : "bg-zinc-950 text-zinc-400 border border-white/5 hover:text-white"
                                  }`}
                                >
                                  <span>{p.name}</span>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <textarea
                          value={strat.notes}
                          onChange={(e) => handleUpdateMatchupNotes(strat.id, e.target.value)}
                          placeholder="Instrucciones tácticas (ej: meter campo, ignorar a su lead y hacer KO directo)..."
                          rows={3}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-400 leading-relaxed custom-scrollbar"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 3: MATRIZ Y PUNTOS CIEGOS */}
          {mainView === "matrix" && (
            <div className="space-y-5">
              {coverageAnalysis && coverageAnalysis.criticalWeaknesses.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-rose-300 block">¡Debilidades Compartidas Críticas!</span>
                      <span className="text-zinc-400">
                        Tu equipo tiene 3 o más Pokémon débiles a los tipos:{" "}
                        <strong className="text-white">
                          {coverageAnalysis.criticalWeaknesses.map(([t]) => t).join(", ")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Resumen de Resistencias & Debilidades (18 Tipos):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                  {ALL_TYPES.map((t) => {
                    const data = coverageAnalysis?.analysis[t];
                    if (!data) return null;
                    const isDanger = data.weak >= 3;
                    return (
                      <div
                        key={t}
                        className={`p-2.5 rounded-xl border transition ${
                          isDanger
                            ? "bg-rose-500/20 border-rose-500/50"
                            : data.resist > data.weak
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-zinc-950 border-white/5"
                        }`}
                      >
                        <span className="text-[11px] uppercase font-bold text-zinc-300 block">{t}</span>
                        <div className="flex items-center justify-center gap-2 mt-1 font-mono text-xs font-bold">
                          <span className={data.weak > 0 ? "text-rose-400" : "text-zinc-600"}>-{data.weak}</span>
                          <span className={data.resist > 0 ? "text-emerald-400" : "text-zinc-600"}>+{data.resist}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {offensiveCoverage && (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Cobertura Ofensiva por STAB:
                  </span>

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
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 4: CAJA PC */}
          {mainView === "pc" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Suplentes en Reserva ({storageBox.length}):
                </span>
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar en PC</span>
                </button>
              </div>

              {storageBox.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs space-y-1">
                  <Archive className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                  <p>La Caja PC está vacía.</p>
                  <p>Guarda suplentes para rotarlos al equipo titular según las reglas del torneo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {storageBox.map((m) => (
                    <div
                      key={m.memberId}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={m.sprite} alt={m.name} className="w-10 h-10 object-contain" />
                        <span className="text-xs font-bold text-white truncate">{m.name}</span>
                      </div>
                      <button
                        onClick={() => handleMovePcToTeam(m)}
                        disabled={activeTeam && activeTeam.pokemonList.length >= 6}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
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
