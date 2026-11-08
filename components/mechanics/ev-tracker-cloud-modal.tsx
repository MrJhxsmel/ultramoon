"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, CheckCircle2, Shield, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EvTarget {
  id: string;
  pokemon_name: string;
  pokemon_id: number;
  hp_evs: number;
  atk_evs: number;
  def_evs: number;
  spa_evs: number;
  spd_evs: number;
  spe_evs: number;
  notes: string;
}

export function EvTrackerCloudModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}) {
  const [targets, setTargets] = useState<EvTarget[]>([]);
  const [newPokeName, setNewPokeName] = useState("");
  const [newPokeId, setNewPokeId] = useState(445);
  const [loading, setLoading] = useState(false);

  const fetchTargets = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_ev_targets")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setTargets(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && user) fetchTargets();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPokeName.trim() || !user) return;

    const newEntry = {
      user_id: user.id,
      pokemon_name: newPokeName.trim(),
      pokemon_id: newPokeId,
      hp_evs: 0,
      atk_evs: 252,
      def_evs: 0,
      spa_evs: 0,
      spd_evs: 4,
      spe_evs: 252,
      notes: "Objetivo de entrenamiento",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("user_ev_targets").insert(newEntry).select();
    if (data && !error) {
      setTargets([data[0], ...targets]);
      setNewPokeName("");
    }
  };

  const handleUpdateEv = async (id: string, stat: string, delta: number) => {
    const target = targets.find((t) => t.id === id);
    if (!target) return;

    const currentVal = (target as any)[stat] || 0;
    const newVal = Math.max(0, Math.min(252, currentVal + delta));

    setTargets(targets.map((t) => (t.id === id ? { ...t, [stat]: newVal } : t)));

    await supabase
      .from("user_ev_targets")
      .update({ [stat]: newVal, updated_at: new Date().toISOString() })
      .eq("id", id);
  };

  const handleDelete = async (id: string) => {
    setTargets(targets.filter((t) => t.id !== id));
    await supabase.from("user_ev_targets").delete().eq("id", id);
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Rastreador de Caza de EVs en la Nube</h3>
                <p className="text-xs text-zinc-400">Progreso guardado automáticamente en tu cuenta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulario nuevo objetivo */}
          <form onSubmit={handleAddTarget} className="p-4 border-b border-white/5 bg-zinc-900/40 flex gap-2">
            <input
              type="text"
              required
              placeholder="Nombre de la especie (ej. Garchomp)"
              value={newPokeName}
              onChange={(e) => setNewPokeName(e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Meta</span>
            </button>
          </form>

          {/* Lista de objetivos */}
          <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {targets.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-10">
                No tienes objetivos de EVs activos. Añade uno arriba para comenzar a farmear.
              </p>
            ) : (
              targets.map((t) => {
                const totalEvs = t.hp_evs + t.atk_evs + t.def_evs + t.spa_evs + t.spd_evs + t.spe_evs;
                return (
                  <div key={t.id} className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${t.pokemon_id || 445}.png`}
                          alt={t.pokemon_name}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{t.pokemon_name}</h4>
                          <span className="text-[10px] text-purple-400 font-mono font-semibold">
                            Total: {totalEvs} / 510 EVs
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contadores por estadística */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      {[
                        { key: "hp_evs", label: "HP", val: t.hp_evs },
                        { key: "atk_evs", label: "ATK", val: t.atk_evs },
                        { key: "def_evs", label: "DEF", val: t.def_evs },
                        { key: "spa_evs", label: "SPA", val: t.spa_evs },
                        { key: "spd_evs", label: "SPD", val: t.spd_evs },
                        { key: "spe_evs", label: "SPE", val: t.spe_evs },
                      ].map((st) => (
                        <div key={st.key} className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-zinc-400 block">{st.label}</span>
                          <span className="font-mono font-black text-purple-300">{st.val}</span>
                          <div className="flex justify-center gap-1 pt-1">
                            <button
                              onClick={() => handleUpdateEv(t.id, st.key, -4)}
                              className="w-5 h-5 rounded bg-zinc-800 text-[10px] hover:bg-zinc-700"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdateEv(t.id, st.key, 4)}
                              className="w-5 h-5 rounded bg-purple-600 text-[10px] hover:bg-purple-500 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
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
