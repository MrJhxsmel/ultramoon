"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Zap, ArrowRight } from "lucide-react";
import { SAMPLE_POKEMON } from "@/data/sample-pokemon";
import { PokemonData } from "@/types/pokemon";

// Colores oficiales por tipo con estilo neón sutil
const typeColors: Record<string, string> = {
  fire: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  water: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  grass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  electric: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  ghost: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  poison: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  fighting: "bg-red-500/10 text-red-400 border-red-500/30",
  steel: "bg-slate-400/10 text-slate-300 border-slate-400/30",
  dragon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  ground: "bg-yellow-600/10 text-yellow-500 border-yellow-600/30",
  fairy: "bg-pink-400/10 text-pink-300 border-pink-400/30",
  psychic: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  flying: "bg-sky-400/10 text-sky-300 border-sky-400/30",
};

export function SearchModal({
  isOpen,
  onClose,
  onSelectPokemon,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (pkmn: PokemonData) => void;
}) {
  const [query, setQuery] = useState("");

  // Atajo de teclado global ⌘K / Ctrl+K y escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Abrir
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = SAMPLE_POKEMON.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.types.some((t) => t.toLowerCase().includes(q)) ||
      p.biomes.some((b) => b.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Telón de fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal flotante estilo Spotlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-zinc-900/90 dark:bg-[#0c0c0e]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-10"
          >
            {/* Input de búsqueda */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
              <Search className="w-5 h-5 text-zinc-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Busca por nombre, tipo (ej. ghost) o bioma..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-medium"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de resultados */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500 font-normal">
                  No se encontraron resultados en la base de Cobblemon.
                </div>
              ) : (
                filtered.map((pkmn) => (
                  <div
                    key={pkmn.id}
                    onClick={() => {
                      onSelectPokemon(pkmn);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={pkmn.sprite}
                        alt={pkmn.name}
                        className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-100">
                            {pkmn.name}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            #{String(pkmn.id).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                            {pkmn.biomes.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {pkmn.types.map((type) => (
                          <span
                            key={type}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              typeColors[type] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer técnico del modal */}
            <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500">
              <span>Navega con flechas y presiona Enter</span>
              <span className="font-mono">ESC para cerrar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
