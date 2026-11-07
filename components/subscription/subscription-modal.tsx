"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, QrCode, Key, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userProfile: any;
  onSuccessRedeem?: () => void;
  onOpenAuth?: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  user,
  userProfile,
  onSuccessRedeem,
  onOpenAuth,
}: SubscriptionModalProps) {
  const [keyCode, setKeyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const isVip = userProfile?.subscription_status === "vip" || userProfile?.role === "admin";

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth?.();
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const { data, error } = await supabase.rpc("redeem_subscription_key", {
        input_key: keyCode.trim().toUpperCase(),
      });

      if (error) throw error;

      if (data?.success) {
        setMsg({ type: "success", text: data.message });
        setKeyCode("");
        if (onSuccessRedeem) {
          onSuccessRedeem();
        }
      } else {
        setMsg({ type: "error", text: data?.message || "No se pudo canjear la clave." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al procesar el código." });
    } finally {
      setLoading(false);
    }
  };

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
          className="relative w-full max-w-xl bg-zinc-950 border border-purple-500/30 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Crown className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Membresía Ultramoon VIP</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-black">
                    30 DÍAS
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Acceso sin límites a todas las herramientas PRO</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {!user ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-200">
                <span>Debes iniciar sesión para activar tu membresía.</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black uppercase text-[10px] hover:bg-amber-300 transition"
                >
                  Iniciar Sesión
                </button>
              </div>
            ) : isVip ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  ¡Tu membresía VIP está <strong>ACTIVA</strong>! Tienes acceso total a todas las herramientas.
                </span>
              </div>
            ) : null}

            {/* SECCIÓN 1: PAGO POR YAPE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="w-36 h-36 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg relative overflow-hidden group">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=YAPE-PAGO-ULTRAMOON"
                    alt="QR Yape"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-purple-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white p-2">
                    <QrCode className="w-8 h-8 text-amber-300 mb-1" />
                    <span className="text-[10px] font-bold">Escanea con tu App Yape</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-300 mt-2">Yape Directo</span>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿Cómo obtener tu clave?</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 text-[11px]">
                  <li>Escanea el código QR desde tu app <strong>Yape</strong>.</li>
                  <li>Realiza el pago del plan mensual.</li>
                  <li>Envía la captura del comprobante al admin para recibir tu <strong>Key VIP</strong>.</li>
                  <li>Pega el código abajo para activarlo al instante.</li>
                </ol>
              </div>
            </div>

            {/* SECCIÓN 2: CANJEAR KEY */}
            <form onSubmit={handleRedeem} className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>¿Ya tienes tu clave de 30 días?</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                  placeholder="Ej. ULTRA-9X82-K7L1"
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono tracking-wider placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Canjear</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {msg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    msg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                  }`}
                >
                  {msg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{msg.text}</span>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}