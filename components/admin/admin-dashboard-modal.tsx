"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  ToggleLeft,
  ToggleRight,
  Key,
  Plus,
  Copy,
  Check,
  Search,
  Sparkles,
  Trash2,
  UserX,
  UserCheck,
} from "lucide-react";
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
  used_by_email?: string | null;
  used_by?: string | null;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onFeatureToggled?: (featureId: string, isPremium: boolean) => void;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  user,
  onFeatureToggled,
}: AdminDashboardModalProps) {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [keys, setKeys] = useState<SubKey[]>([]);
  const [searchFeature, setSearchFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: featData } = await supabase
      .from("feature_flags")
      .select("*")
      .order("title", { ascending: true });
    if (featData) setFeatures(featData);

    const { data: keyData } = await supabase
      .from("admin_subscription_keys_view")
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

    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_premium: newVal } : f))
    );

    if (onFeatureToggled) onFeatureToggled(id, newVal);

    const updatedFeature = features.find((f) => f.id === id);
    const title = updatedFeature?.title || "Módulo";
    setToastMessage(`«${title}» ahora es ${newVal ? "VIP EXCLUSIVO" : "ACCESO LIBRE"}`);
    setTimeout(() => setToastMessage(null), 3000);

    const { error } = await supabase
      .from("feature_flags")
      .update({ is_premium: newVal, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      setToastMessage("Error al guardar en Supabase");
    }
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
      setKeys([{ ...data[0], used_by_email: null }, ...keys]);
      setToastMessage(`Nueva Key creada: ${randomCode}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteKey = async (keyCode: string) => {
    if (!confirm(`¿Eliminar la clave ${keyCode}? Esta acción no se puede deshacer.`)) {
      return;
    }

    const { error } = await supabase
      .from("subscription_keys")
      .delete()
      .eq("key_code", keyCode);

    if (!error) {
      setKeys((prev) => prev.filter((k) => k.key_code !== keyCode));
      setToastMessage(`Clave ${keyCode} eliminada.`);
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      setToastMessage("Error al eliminar la clave.");
    }
  };

  const handleRevokeUserVip = async (userId: string, email: string) => {
    if (!confirm(`¿Revocar el estado VIP a ${email}? Pasará a cuenta gratuita.`)) {
      return;
    }

    const { data, error } = await supabase.rpc("admin_revoke_user_vip", {
      target_user_id: userId,
    });

    if (!error && data?.success) {
      setToastMessage(`Membresía VIP revocada a ${email}.`);
      fetchAdminData();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(data?.message || "Error al revocar usuario.");
    }
  };

  const copyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(code);
    setToastMessage("Key copiada al portapapeles");
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage(null);
    }, 2000);
  };

  const filteredFeatures = features.filter(
    (f) =>
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
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 shrink-0">
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

          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-4 sm:mx-5 mt-4 p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-bold">{toastMessage}</span>
                </div>
                <span className="text-[10px] text-purple-300 font-mono uppercase bg-purple-500/30 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Actualizado
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* SWITCHES DE FUNCIONES */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
                    Switches de Módulos ({features.length} Disponibles)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Marca qué herramientas requieren membresía VIP en tiempo real.
                  </p>
                </div>

                <div className="relative min-w-[200px]">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {filteredFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
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
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{feat.description}</p>
                    </div>

                    <button
                      onClick={() => toggleFeature(feat.id, feat.is_premium)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
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

            {/* GESTOR DE CLAVES & USUARIOS ACTIVOS */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
                    Gestión de Keys & Membresías de 30 Días
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Copia, elimina claves no deseadas o remueve el acceso VIP a un usuario.
                  </p>
                </div>
                <button
                  onClick={handleGenerateKey}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Key de 30 Días</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {keys.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Aún no has generado claves. Pulsa el botón superior para crear una.
                  </p>
                ) : (
                  keys.map((k) => (
                    <div
                      key={k.key_code}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                        k.is_used
                          ? "bg-black/25 border-white/5 text-zinc-400"
                          : "bg-zinc-900 border-purple-500/20 text-purple-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="font-bold tracking-wider">{k.key_code}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              k.is_used
                                ? "bg-zinc-800 text-zinc-400"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {k.is_used ? "Canjeada" : "Disponible"}
                          </span>
                          {k.used_by_email && (
                            <span className="text-[10px] text-amber-300 font-sans truncate max-w-[180px]">
                              ({k.used_by_email})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {!k.is_used && (
                          <button
                            onClick={() => copyKey(k.key_code)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-sans flex items-center gap-1 text-zinc-300 transition"
                            title="Copiar código"
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

                        {/* Botón para revocar VIP al usuario si la key ya fue canjeada */}
                        {k.is_used && k.used_by && k.used_by_email && (
                          <button
                            onClick={() => handleRevokeUserVip(k.used_by!, k.used_by_email!)}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-sans flex items-center gap-1 transition"
                            title="Quitar acceso VIP a este usuario"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Revocar VIP</span>
                          </button>
                        )}

                        {/* Botón para eliminar la clave */}
                        <button
                          onClick={() => handleDeleteKey(k.key_code)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition"
                          title="Eliminar registro de clave"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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