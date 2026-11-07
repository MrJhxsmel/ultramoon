"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Check, ArrowRight, ShieldCheck, Zap, Cloud } from "lucide-react";

interface VipWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName?: string;
}

export function VipWelcomeModal({ isOpen, onClose, trainerName }: VipWelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Fondo oscuro con desenfoque */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        />

        {/* Ventana de Celebración */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-400/50 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.25)] z-50 overflow-hidden text-center p-6 sm:p-8"
        >
          {/* Resplandor decorativo de fondo */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-400/20 blur-3xl rounded-full" />

          {/* Icono Principal con efecto pulsante */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-5">
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Crown className="w-10 h-10 text-amber-400" />
              </motion.div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
          </div>

          {/* Título de Bienvenida */}
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-block mb-2">
            ✦ Rango Desbloqueado ✦
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
            ¡Bienvenido a Ultramoon VIP!
          </h3>
          <p className="text-xs text-zinc-400 mt-2">
            Felicidades, <strong className="text-amber-300">{trainerName || "Entrenador"}</strong>. Tu suscripción de 30 días ya está activa en tu cuenta.
          </p>

          {/* Lista de Beneficios Desbloqueados */}
          <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Generador de comandos <strong className="text-purple-300 font-mono">/pokegive</strong> completo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <span>Sincronización ilimitada de <strong>Caza de EVs Cloud</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Acceso total sin bloqueos a las <strong>14 herramientas</strong></span>
            </div>
          </div>

          {/* Botón de acción para comenzar */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Empezar a Dominar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}