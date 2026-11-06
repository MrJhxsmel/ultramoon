"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Save, CheckCircle2, AlertCircle, Palette, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated?: (profile: any) => void;
}

export function ProfileModal({ isOpen, onClose, user, onProfileUpdated }: ProfileModalProps) {
  const [trainerName, setTrainerName] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [preferredTheme, setPreferredTheme] = useState("midnight");
  const [soundVolume, setSoundVolume] = useState(35);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        setTrainerName(data.trainer_name || "");
        setMinecraftUsername(data.minecraft_username || "");
        setPreferredTheme(data.preferred_theme || "midnight");
        setSoundVolume(data.sound_volume ?? 35);
      }
    }

    loadProfile();
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updates = {
        id: user.id,
        trainer_name: trainerName.trim(),
        minecraft_username: minecraftUsername.trim(),
        preferred_theme: preferredTheme,
        sound_volume: soundVolume,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;

      setMessage({ type: "success", text: "¡Perfil guardado correctamente!" });
      onProfileUpdated?.(updates);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error al actualizar perfil" });
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = minecraftUsername.trim()
    ? `https://minotar.net/helm/${encodeURIComponent(minecraftUsername.trim())}/64.png`
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Skin avatar"
                  className="w-10 h-10 rounded-xl border border-purple-500/30 bg-zinc-900 object-contain shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white">Ajustes de Perfil</h3>
                <p className="text-[11px] text-zinc-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avisos */}
          {message && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-medium">Nombre de Entrenador (IGN)</label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Ej. Red, Cynthia o tu apodo"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-medium">Nick de Minecraft (para cargar Skin)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={minecraftUsername}
                  onChange={(e) => setMinecraftUsername(e.target.value)}
                  placeholder="Tu nick de Minecraft Java"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-mono text-xs"
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Se usará para renderizar tu cabeza de Minecraft en la barra superior.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tema Favorito</span>
                </label>
                <select
                  value={preferredTheme}
                  onChange={(e) => setPreferredTheme(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="midnight">Midnight Void</option>
                  <option value="slate">Cyber Slate</option>
                  <option value="quartz">Nether Quartz</option>
                  <option value="emerald">Taiga Emerald</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Volumen ({soundVolume}%)</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-full mt-2 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
