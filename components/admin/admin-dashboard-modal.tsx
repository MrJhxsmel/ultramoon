"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ToggleLeft, ToggleRight, Key, Plus, Copy, Check, Search, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FeatureFlag {
  id: string;
  title: string;
  description: string;
  is_premium: boolean;
}

interface SubKey {
  key_code: string;
  days_valid: number;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}) {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [keys, setKeys] = useState<SubKey[]>([]);
  const [searchFeature, setSearchFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: featData } = await supabase
      .from("feature_flags")
      .select("*")
      .order("title", { ascending: true });
    if (featData) setFeatures(featData);

    const { data: keyData } = await supabase
      .from("subscription_keys")
      .select("*")
      .order("created_at", { ascending: false });
    if (keyData) setKeys(keyData);

    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && user) fetchAdminData();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleFeature = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setFeatures(features.map((f) => (f.id === id ? { ...f, is_premium: newVal } : f)));
    await supabase.from("feature_flags").update({ is_premium: newVal }).eq("id", id);
  };

  const handleGenerateKey = async () => {
    const randomCode =
      "ULTRA-" +
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const { data, error } = await supabase
      .from("subscription_keys")
      .insert({ key_code: randomCode, days_valid: 30 })
      .select();

    if (data && !error) {
      setKeys([data[0], ...keys]);
    }
  };

  const copyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(code);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredFeatures = features.filter((f) =>
    f.title.toLowerCase().includes(searchFeature.toLowerCase()) ||
    f.description.toLowerCase().includes(searchFeature.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-purple-500/40 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Panel Administrador</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500 text-white font-bold">
                    OWNER
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* SECCIÓN 1: SWITCHES DE TODAS LAS FUNCIONES */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                    <span>Switches de Funciones ({features.length} Disponibles)</span>
                    <span className="text-[10px] text-zinc-400 lowercase font-mono">
                      (en vivo sin recompilar)
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Marca qué herramientas requieren membresía VIP de forma instantánea.
                  </p>
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFeature}
                    onChange={(e) => setSearchFeature(e.target.value)}
                    placeholder="Filtrar funciones..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {filteredFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      feat.is_premium
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-zinc-900/60 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-white truncate">{feat.title}</h5>
                        {feat.is_premium && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-400 text-black font-black uppercase">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2">{feat.description}</p>
                    </div>

                    <button
                      onClick={() => toggleFeature(feat.id, feat.is_premium)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                        feat.is_premium
                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 hover:bg-amber-300"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {feat.is_premium ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{feat.is_premium ? "VIP" : "LIBRE"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: GENERADOR DE KEYS */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
                    Generador de Keys (Membresías de 1 Mes)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Crea un código de 30 días para enviar al usuario que confirme su pago en Yape.
                  </p>
                </div>
                <button
                  onClick={handleGenerateKey}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Key de 30 Días</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {keys.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Aún no has generado claves. Pulsa el botón superior para crear una.
                  </p>
                ) : (
                  keys.map((k) => (
                    <div
                      key={k.key_code}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                        k.is_used
                          ? "bg-black/20 border-white/5 text-zinc-500 opacity-60"
                          : "bg-zinc-900 border-purple-500/20 text-purple-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="font-bold tracking-wider">{k.key_code}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            k.is_used
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {k.is_used ? "Canjeada" : "Disponible (30d)"}
                        </span>
                      </div>

                      {!k.is_used && (
                        <button
                          onClick={() => copyKey(k.key_code)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-sans flex items-center gap-1 text-zinc-300 transition"
                        >
                          {copiedKey === k.key_code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiada</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
