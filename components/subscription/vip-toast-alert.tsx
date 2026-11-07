"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X, Lock } from "lucide-react";

interface VipToastAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: "vip_granted" | "feature_locked";
}

export function VipToastAlert({
  isOpen,
  onClose,
  title,
  description,
  type = "vip_granted",
}: VipToastAlertProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-5 right-5 z-[100] max-w-sm w-full p-4 rounded-2xl bg-zinc-950/95 border-2 border-amber-400/60 shadow-[0_10px_40px_rgba(251,191,36,0.3)] backdrop-blur-xl flex items-start gap-3.5"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
          {type === "vip_granted" ? (
            <Crown className="w-5 h-5 text-amber-300 animate-bounce" />
          ) : (
            <Lock className="w-5 h-5 text-amber-300" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{type === "vip_granted" ? "¡Membresía Activada!" : "Aviso de Módulo"}</span>
            </span>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-black text-white">{title}</h4>
          <p className="text-[11px] text-zinc-300 leading-snug">{description}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}