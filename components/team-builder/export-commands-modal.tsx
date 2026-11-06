"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Copy, Check, Sparkles, Download, FileJson } from "lucide-react";
import { generatePokegiveCommand, generatePokespawnCommand, ExportPokemonData } from "@/lib/cobblemon-commands";

interface ExportCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  pokemonList: any[];
  trainerName?: string;
}

export function ExportCommandsModal({
  isOpen,
  onClose,
  teamName,
  pokemonList,
  trainerName = "@s",
}: ExportCommandsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [commandType, setCommandType] = useState<"pokegive" | "pokespawn">("pokegive");

  if (!isOpen) return null;

  const validPokemon: ExportPokemonData[] = pokemonList.filter(Boolean).map((p: any) => ({
    name: p.name || p.species || "Pikachu",
    level: p.level || 50,
    shiny: Boolean(p.shiny),
    nature: p.nature || "Adamant",
    ability: p.ability || "",
    item: p.item || "",
    moves: p.moves || [],
    ivs: p.ivs,
    evs: p.evs,
  }));

  const commands = validPokemon.map((p) =>
    commandType === "pokegive"
      ? generatePokegiveCommand(p, trainerName || "@s")
      : generatePokespawnCommand(p)
  );

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllCommands = () => {
    navigator.clipboard.writeText(commands.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ teamName, pokemon: validPokemon, exportedAt: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${teamName.toLowerCase().replace(/\s+/g, "_")}_cobblemon.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Exportar Comandos Cobblemon</span>
                  <span className="px-2 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded-full font-bold">
                    PRO
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Equipo: <span className="text-white font-semibold">{teamName}</span> ({validPokemon.length} Pokémon)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Opciones y Acciones Rápidas */}
          <div className="p-5 border-b border-white/5 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandType("pokegive")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  commandType === "pokegive"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                /pokegive (Directo a inventario)
              </button>
              <button
                onClick={() => setCommandType("pokespawn")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  commandType === "pokespawn"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                /pokespawn (Generar salvaje)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadJson}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Descargar copia de seguridad en JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-purple-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={copyAllCommands}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? "¡Todo copiado!" : "Copiar todos"}</span>
              </button>
            </div>
          </div>

          {/* Lista de Comandos */}
          <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar">
            {commands.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">
                No hay Pokémon agregados en este equipo todavía.
              </p>
            ) : (
              commands.map((cmd, idx) => {
                const poke = validPokemon[idx];
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 hover:border-white/10 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>#{idx + 1} {poke.name}</span>
                        {poke.shiny && <span className="text-amber-400 text-[10px]">★ Shiny</span>}
                      </span>
                      <button
                        onClick={() => copyToClipboard(cmd, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 flex items-center gap-1 transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-purple-300 break-all select-all">
                      {cmd}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
