"use client";

import React, { useState, useMemo } from "react";
import {
  Swords,
  ShieldAlert,
  Zap,
  ArrowRightLeft,
  Sparkles,
  Shield,
  Crosshair,
} from "lucide-react";

// Tabla oficial de efectividades elementales Gen 9
const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Ghost: 0, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Fairy: 2, Steel: 0.5 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

const ALL_TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

// Movimientos competitivos por defecto según la especie
const DEFAULT_MOVESET: Record<string, Array<{ name: string; type: string; category: "Physical" | "Special" | "Status"; power: number }>> = {
  Charizard: [
    { name: "Onda Ígnea", type: "Fire", category: "Special", power: 95 },
    { name: "Ascuas", type: "Fire", category: "Special", power: 40 },
    { name: "Ataque Ala", type: "Flying", category: "Physical", power: 60 },
    { name: "Protección", type: "Normal", category: "Status", power: 0 },
  ],
  Garchomp: [
    { name: "Terremoto", type: "Ground", category: "Physical", power: 100 },
    { name: "Garra Dragón", type: "Dragon", category: "Physical", power: 80 },
    { name: "Roca Afilada", type: "Rock", category: "Physical", power: 100 },
    { name: "Danza Espada", type: "Normal", category: "Status", power: 0 },
  ],
  "Rotom-Wash": [
    { name: "Hidrobomba", type: "Water", category: "Special", power: 110 },
    { name: "Rayo", type: "Electric", category: "Special", power: 90 },
    { name: "Voltiocambio", type: "Electric", category: "Special", power: 70 },
    { name: "Fuego Fatuo", type: "Fire", category: "Status", power: 0 },
  ],
  "Rotom-Heat": [
    { name: "Sofoco", type: "Fire", category: "Special", power: 130 },
    { name: "Rayo", type: "Electric", category: "Special", power: 90 },
    { name: "Voltiocambio", type: "Electric", category: "Special", power: 70 },
    { name: "Fuego Fatuo", type: "Fire", category: "Status", power: 0 },
  ],
  "Rotom-Mow": [
    { name: "Lluevehojas", type: "Grass", category: "Special", power: 130 },
    { name: "Rayo", type: "Electric", category: "Special", power: 90 },
    { name: "Voltiocambio", type: "Electric", category: "Special", power: 70 },
    { name: "Truco", type: "Psychic", category: "Status", power: 0 },
  ],
  Rotom: [
    { name: "Rayo", type: "Electric", category: "Special", power: 90 },
    { name: "Bola Sombra", type: "Ghost", category: "Special", power: 80 },
    { name: "Voltiocambio", type: "Electric", category: "Special", power: 70 },
    { name: "Fuego Fatuo", type: "Fire", category: "Status", power: 0 },
  ],
  Graveler: [
    { name: "Terremoto", type: "Ground", category: "Physical", power: 100 },
    { name: "Avalancha", type: "Rock", category: "Physical", power: 75 },
    { name: "Lanzarrocas", type: "Rock", category: "Physical", power: 50 },
    { name: "Defensa Férrea", type: "Steel", category: "Status", power: 0 },
  ],
  Alakazam: [
    { name: "Psíquico", type: "Psychic", category: "Special", power: 90 },
    { name: "Bola Sombra", type: "Ghost", category: "Special", power: 80 },
    { name: "Onda Certera", type: "Fighting", category: "Special", power: 120 },
    { name: "Paz Mental", type: "Psychic", category: "Status", power: 0 },
  ],
  Salamence: [
    { name: "Cometa Draco", type: "Dragon", category: "Special", power: 130 },
    { name: "Llamarada", type: "Fire", category: "Special", power: 110 },
    { name: "Tajo Aéreo", type: "Flying", category: "Special", power: 75 },
    { name: "Hidrobomba", type: "Water", category: "Special", power: 110 },
  ],
  Gigalith: [
    { name: "Roca Afilada", type: "Rock", category: "Physical", power: 100 },
    { name: "Terremoto", type: "Ground", category: "Physical", power: 100 },
    { name: "Cuerpo Pesado", type: "Steel", category: "Physical", power: 120 },
    { name: "Trampa Rocas", type: "Rock", category: "Status", power: 0 },
  ],
  Kilowattrel: [
    { name: "Rayo", type: "Electric", category: "Special", power: 90 },
    { name: "Vendaval", type: "Flying", category: "Special", power: 110 },
    { name: "Voltiocambio", type: "Electric", category: "Special", power: 70 },
    { name: "Viento Afín", type: "Flying", category: "Status", power: 0 },
  ],
};

function getPokemonSpriteUrl(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `https://play.pokemonshowdown.com/sprites/gen5/${clean}.png`;
}

function calculateMultiplier(attackType: string, defenderTypes: string[]): number {
  let mult = 1;
  const attackMap = TYPE_CHART[attackType] || {};
  defenderTypes.forEach((defType) => {
    if (attackMap[defType] !== undefined) {
      mult *= attackMap[defType];
    }
  });
  return mult;
}

export function BattleCoachTab({ team }: { team: any[] }) {
  const [activePokeIndex, setActivePokeIndex] = useState(0);

  // Rival seleccionado para cálculo
  const [enemyName, setEnemyName] = useState("Marshtomp");
  const [enemyTypes, setEnemyTypes] = useState<string[]>(["Water", "Ground"]);

  // Equipo activo del usuario
  const effectiveTeam = useMemo(() => {
    if (team && team.length > 0) return team;
    return [
      { name: "Charizard", types: ["Fire", "Flying"], level: 50 },
      { name: "Garchomp", types: ["Dragon", "Ground"], level: 50 },
    ];
  }, [team]);

  const currentPokemon = effectiveTeam[activePokeIndex] || effectiveTeam[0];

  // Movimientos del Pokémon activo
  const moves = useMemo(() => {
    if (currentPokemon?.moves && currentPokemon.moves.length > 0) {
      return currentPokemon.moves.map((m: any) =>
        typeof m === "string"
          ? { name: m, type: currentPokemon.types[0] || "Normal", category: "Physical", power: 75 }
          : m
      );
    }
    return (
      DEFAULT_MOVESET[currentPokemon?.name] || [
        { name: "Ataque Primario", type: currentPokemon?.types?.[0] || "Normal", category: "Physical", power: 80 },
        { name: "Ataque Secundario", type: currentPokemon?.types?.[1] || currentPokemon?.types?.[0] || "Normal", category: "Special", power: 70 },
        { name: "Cobertura", type: "Normal", category: "Physical", power: 60 },
        { name: "Protección", type: "Normal", category: "Status", power: 0 },
      ]
    );
  }, [currentPokemon]);

  // Análisis de multiplicador para cada ataque
  const movesAnalysis = useMemo(() => {
    return moves.map((move: any) => {
      if (move.category === "Status") {
        return { ...move, mult: 1, note: "Estado / Utilidad", score: 0 };
      }
      const mult = calculateMultiplier(move.type, enemyTypes);
      const isStab = currentPokemon?.types?.includes(move.type);
      const effectivePower = (move.power || 60) * mult * (isStab ? 1.5 : 1);

      let note = "Daño neutro (1x)";
      if (mult >= 2) note = `¡SÚPER EFICAZ! (${mult}x)`;
      if (mult === 0) note = "INMUNE (0x)";
      if (mult > 0 && mult < 1) note = `Poco eficaz (${mult}x)`;

      return { ...move, mult, note, score: effectivePower, isStab };
    });
  }, [moves, enemyTypes, currentPokemon]);

  // Movimiento sugerido de mayor impacto
  const bestMove = useMemo(() => {
    const offensive = movesAnalysis.filter((m: any) => m.category !== "Status");
    if (!offensive.length) return null;
    return offensive.reduce((prev: any, curr: any) => (curr.score > prev.score ? curr : prev));
  }, [movesAnalysis]);

  // Debilidades del rival (>= 2x)
  const enemyWeaknesses = useMemo(() => {
    return ALL_TYPES.map((t) => ({ type: t, mult: calculateMultiplier(t, enemyTypes) })).filter(
      (w) => w.mult >= 2
    );
  }, [enemyTypes]);

  // Resistencias o inmunidades del rival (< 1x)
  const enemyResistances = useMemo(() => {
    return ALL_TYPES.map((t) => ({ type: t, mult: calculateMultiplier(t, enemyTypes) })).filter(
      (r) => r.mult < 1
    );
  }, [enemyTypes]);

  return (
    <div className="space-y-6 pt-2">
      {/* Selector de Pokémon y Rivales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tu Pokémon Activo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Tu Pokémon en Campo
            </span>
            <div className="flex gap-1">
              {currentPokemon.types?.map((t: string) => (
                <span
                  key={t}
                  className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={currentPokemon.sprite || getPokemonSpriteUrl(currentPokemon.name)}
                alt={currentPokemon.name}
                className="w-full h-full object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{currentPokemon.name}</h3>
              <p className="text-xs text-zinc-400 font-mono">Nivel {currentPokemon.level || 50}</p>
            </div>
          </div>

          {/* Selector de cambio entre miembros de tu equipo */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Cambiar Pokémon activo:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {effectiveTeam.map((poke: any, idx: number) => (
                <button
                  key={poke.name + idx}
                  onClick={() => setActivePokeIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                    activePokeIndex === idx
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  <img
                    src={getPokemonSpriteUrl(poke.name)}
                    alt={poke.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span>{poke.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rival en Campo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" /> Pokémon Rival
            </span>
            <div className="flex gap-1">
              {enemyTypes.map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={getPokemonSpriteUrl(enemyName)}
                alt={enemyName}
                className="w-full h-full object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={enemyName}
                onChange={(e) => setEnemyName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-base font-bold text-white focus:outline-none focus:border-rose-500"
                placeholder="Nombre del rival..."
              />
            </div>
          </div>

          {/* Ajuste de tipos elementales del rival */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-semibold block">
              Tipos del enemigo (selecciona 1 o 2):
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1">
              {ALL_TYPES.map((type) => {
                const selected = enemyTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      if (selected) {
                        if (enemyTypes.length > 1) setEnemyTypes(enemyTypes.filter((t) => t !== type));
                      } else {
                        if (enemyTypes.length < 2) setEnemyTypes([...enemyTypes, type]);
                        else setEnemyTypes([enemyTypes[1], type]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                      selected
                        ? "bg-rose-500/30 border-rose-400 text-rose-200"
                        : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sugerencia de Movimiento Óptimo */}
      {bestMove && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-zinc-900 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-semibold">
                Mejor Ataque para este Turno
              </p>
              <h4 className="text-base sm:text-lg font-black text-white">
                Usar {bestMove.name} ({bestMove.type})
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bestMove.isStab && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                +STAB 1.5x
              </span>
            )}
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                bestMove.mult >= 2
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                  : bestMove.mult < 1
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : "bg-purple-500/20 border-purple-400 text-purple-300"
              }`}
            >
              {bestMove.note}
            </span>
          </div>
        </div>
      )}

      {/* Lista de Ataques con Multiplicadores de Daño */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Swords className="w-4 h-4 text-purple-400" />
          <span>Efectividad de los 4 movimientos contra {enemyName}:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {movesAnalysis.map((move: any) => {
            const isSuper = move.mult >= 2;
            const isResisted = move.mult > 0 && move.mult < 1;
            const isImmune = move.mult === 0;

            return (
              <div
                key={move.name}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  isSuper
                    ? "bg-emerald-950/25 border-emerald-500/40"
                    : isImmune
                    ? "bg-zinc-900/80 border-rose-500/40 opacity-50"
                    : isResisted
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-zinc-900/40 border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{move.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold">
                      {move.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Potencia: <span className="font-mono text-zinc-200">{move.power || "-"}</span> · {move.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl font-mono ${
                      isSuper
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isImmune
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : isResisted
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-zinc-300 border border-white/10"
                    }`}
                  >
                    {move.mult}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Radiografía Elemental del Rival */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Debilidades */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-2.5">
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Debilidades del Rival (Atácale con esto)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {enemyWeaknesses.length > 0 ? (
              enemyWeaknesses.map((w) => (
                <span
                  key={w.type}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1"
                >
                  <span>{w.type}</span>
                  <span className="text-[10px] font-mono opacity-80 font-black">{w.mult}x</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">Sin debilidades destacables.</span>
            )}
          </div>
        </div>

        {/* Resistencias */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-2.5">
          <span className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Resistencias del Rival (Evita estos tipos)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {enemyResistances.length > 0 ? (
              enemyResistances.map((r) => (
                <span
                  key={r.type}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1"
                >
                  <span>{r.type}</span>
                  <span className="text-[10px] font-mono opacity-80 font-black">
                    {r.mult === 0 ? "Inmune" : `${r.mult}x`}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">No resiste ningún tipo elemental.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}