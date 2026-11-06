"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Palette,
  Volume2,
  Sparkles,
  Shield,
  Search,
  Swords,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated?: (profile: any) => void;
}

const COMMON_PARTNERS = [
  { id: 445, name: "Garchomp" },
  { id: 6, name: "Charizard" },
  { id: 94, name: "Gengar" },
  { id: 282, name: "Gardevoir" },
  { id: 448, name: "Lucario" },
  { id: 658, name: "Greninja" },
  { id: 778, name: "Mimikyu" },
  { id: 887, name: "Dragapult" },
  { id: 1007, name: "Koraidon" },
  { id: 1008, name: "Miraidon" },
];

export function ProfileModal({ isOpen, onClose, user, onProfileUpdated }: ProfileModalProps) {
  const [trainerName, setTrainerName] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [preferredTheme, setPreferredTheme] = useState("midnight");
  const [soundVolume, setSoundVolume] = useState(35);
  const [defaultFormat, setDefaultFormat] = useState("vgc50");
  const [bio, setBio] = useState("");
  const [partnerId, setPartnerId] = useState<number>(445);
  const [partnerName, setPartnerName] = useState<string>("Garchomp");

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
        setDefaultFormat(data.default_battle_format || "vgc50");
        setBio(data.bio || "");
        if (data.partner_pokemon_id) setPartnerId(data.partner_pokemon_id);
        if (data.partner_pokemon_name) setPartnerName(data.partner_pokemon_name);
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
        default_battle_format: defaultFormat,
        bio: bio.trim(),
        partner_pokemon_id: partnerId,
        partner_pokemon_name: partnerName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;

      setMessage({ type: "success", text: "¡Tarjeta de Entrenador actualizada!" });
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

  const bodySkinUrl = minecraftUsername.trim()
    ? `https://minotar.net/armor/body/${encodeURIComponent(minecraftUsername.trim())}/120.png`
    : null;

  const partnerSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${partnerId}.png`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between p-5 pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide">Ficha de Entrenador</h3>
                <p className="text-[11px] text-zinc-400">Personaliza tu identidad y acompañante</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
            {/* TRAINER CARD PREVIEW (Estilo Credencial) */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-900/60 to-indigo-950/40 p-5 shadow-xl">
              <div className="absolute top-2 right-3 text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest opacity-80">
                ULTRAMOON TRAINER PASSPORT
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                {/* Personaje y Datos */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-28 flex items-center justify-center rounded-xl bg-black/30 border border-white/10 overflow-hidden shrink-0">
                    {bodySkinUrl ? (
                      <img
                        src={bodySkinUrl}
                        alt="Skin preview"
                        className="h-24 object-contain drop-shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://minotar.net/armor/body/MHF_Steve/120.png";
                        }}
                      />
                    ) : (
                      <User className="w-10 h-10 text-zinc-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                      {defaultFormat === "vgc50" ? "VGC Nivel 50" : "Singles Nivel 100"}
                    </span>
                    <h4 className="text-lg font-black text-white tracking-tight">
                      {trainerName || minecraftUsername || "Entrenador Anónimo"}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      MC: {minecraftUsername || "Sin vincular"}
                    </p>
                    <p className="text-[11px] text-zinc-500 italic max-w-xs line-clamp-2">
                      {bio || "«Listo para dominar las arenas de Cobblemon»"}
                    </p>
                  </div>
                </div>

                {/* Pokémon Partner */}
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0 min-w-[130px]">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                    Partner Activo
                  </span>
                  <img
                    src={partnerSpriteUrl}
                    alt={partnerName}
                    className="w-16 h-16 object-contain drop-shadow-lg my-1"
                  />
                  <span className="text-xs font-bold text-purple-300">{partnerName}</span>
                </div>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nombre de Entrenador</span>
                  </label>
                  <input
                    type="text"
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    placeholder="Tu apodo competitivo"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nick de Minecraft (Skin)</span>
                  </label>
                  <input
                    type="text"
                    value={minecraftUsername}
                    onChange={(e) => setMinecraftUsername(e.target.value)}
                    placeholder="Nick de Minecraft Java"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              {/* Selector de Pokémon Compañero */}
              <div className="space-y-2">
                <label className="text-zinc-400 font-semibold flex items-center justify-between">
                  <span>Pokémon Acompañante Favorito</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    Selecciona uno de la lista rápida
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COMMON_PARTNERS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setPartnerId(p.id);
                        setPartnerName(p.name);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        partnerId === p.id
                          ? "bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-600/20"
                          : "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900"
                      }`}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lema o Biografía */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold">Lema o Frase de Combate</label>
                <input
                  type="text"
                  maxLength={90}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ej. Estratega de lluvia | Especialista tipo Dragón"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Preferencias de Sistema */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-purple-400" />
                    <span>Formato</span>
                  </label>
                  <select
                    value={defaultFormat}
                    onChange={(e) => setDefaultFormat(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="vgc50">VGC (Nivel 50)</option>
                    <option value="singles100">Singles (Nivel 100)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tema UI</span>
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
                  <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Audio ({soundVolume}%)</span>
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

              {/* Botón de Guardado */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Tarjeta de Entrenador</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
