"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Gauge,
  Swords,
  Egg,
  Compass,
  Crosshair,
  MapPin,
  Box,
  Apple,
  ArrowRight,
} from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectPokemon: (pokemon: PokemonData) => void;
}

export function CommandMenu({
  isOpen,
  onClose,
  onSelectTool,
  onSelectPokemon,
}: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const TOOLS_LIST = [
    { id: "team-builder", name: "Team Builder", desc: "Constructor 6v6 y comandos /pokegive", icon: Users, color: "text-purple-400" },
    { id: "damage-calc", name: "Calculadora de Daño", desc: "Breakpoints VGC, clima y terrenos", icon: Swords, color: "text-rose-400" },
    { id: "comparator", name: "Comparador 1 vs 1", desc: "Speed Tiers, turnos y cobertura de tipos", icon: Gauge, color: "text-blue-400" },
    { id: "pasture", name: "Pasture & Crianza", desc: "Simulador de bloques Pasture e IVs Gen 9", icon: Egg, color: "text-amber-400" },
    { id: "ev-tracker", name: "Guía de EVs", desc: "Biomas de Minecraft para farmear 252 EVs", icon: Compass, color: "text-emerald-400" },
    { id: "capture-calc", name: "Calculadora de Captura", desc: "Probabilidad por Poké Ball y fórmulas", icon: Crosshair, color: "text-cyan-400" },
    { id: "habitats", name: "Buscador de Hábitats", desc: "Spawns en biomas, alturas Y y clima", icon: MapPin, color: "text-teal-400" },
    { id: "evolutions", name: "Evoluciones Especiales", desc: "Métodos por bloques, Link Cable y Amistad", icon: Box, color: "text-orange-400" },
    { id: "apricorns", name: "Apricorns & Bayas", desc: "Forja de Poké Balls y limpieza de EVs", icon: Apple, color: "text-lime-400" },
  ];

  const matchedTools = useMemo(() => {
    if (!query.trim()) return TOOLS_LIST;
    const q = query.toLowerCase();
    return TOOLS_LIST.filter(
      (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const matchedPokemon = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SAMPLE_POKEMON.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        />

        {/* Ventana Spotlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
        >
          {/* Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe una herramienta o Pokémon (ej. daño, pasture, Gengar)..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/10 rounded-lg">
              ESC
            </kbd>
          </div>

          {/* Listado */}
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3 custom-scrollbar text-xs">
            {matchedTools.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1 block">
                  Herramientas
                </span>
                {matchedTools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTool(t.id);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] text-left transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${t.color}`} />
                        </div>
                        <div>
                          <span className="font-bold text-white block group-hover:text-purple-300 transition">
                            {t.name}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {t.desc}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            )}

            {matchedPokemon.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1 block">
                  Pokémon Encontrados
                </span>
                {matchedPokemon.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPokemon(p);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.sprite}
                        alt={p.name}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block group-hover:text-amber-300 transition">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          #{p.id} • {p.types.join("/")}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/5">
                      Abrir Ficha
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchedTools.length === 0 && matchedPokemon.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No se encontraron resultados para "{query}"
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Usa el buscador para saltar rápido</span>
            <span>Ultramoon Spotlight</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
