"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const AURA_COLORS: Record<string, string> = {
  white: "#ffffff",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  gold: "#facc15",
};

export default function OverlayPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [projectiles, setProjectiles] = useState<any[]>([]);
  const [message, setMessage] = useState("⚔️ Arena de Monstros");
  const [hitPlayer, setHitPlayer] = useState("");

  const playersRef = useRef<any[]>([]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    socket.on("playersUpdate", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("arenaMessage", (data) => {
      setMessage(data.text);

      if (data.attacker && data.target) {
        const attacker = playersRef.current.find(
          (p) => p.name === data.attacker
        );

        const target = playersRef.current.find(
          (p) => p.name === data.target
        );

        if (attacker && target) {
          const id = Date.now() + Math.random();

          setProjectiles((prev) => [
            ...prev,
            {
              id,
              fromX: attacker.x,
              fromY: attacker.y,
              toX: target.x,
              toY: target.y,
              color: attacker.color || "#ef4444",
            },
          ]);

          setTimeout(() => {
            setHitPlayer(target.name);

            setTimeout(() => setHitPlayer(""), 250);

            setProjectiles((prev) => prev.filter((p) => p.id !== id));
          }, 700);
        }
      }

      setTimeout(() => {
        setMessage("⚔️ Arena de Monstros");
      }, 2200);
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("arenaMessage");
    };
  }, []);

  function hpColor(hp: number) {
    if (hp > 60) return "#22c55e";
    if (hp > 30) return "#eab308";
    return "#ef4444";
  }

  function iconByLevel(level: number) {
    if (level >= 5) return "👑";
    if (level === 4) return "🐉";
    if (level === 3) return "🐲";
    if (level === 2) return "👹";
    return "👾";
  }

  function arenaX(x: number) {
    return Math.max(6, Math.min(94, x));
  }

  function arenaY(y: number) {
    const normalized = ((y - 40) / 42) * 100;
    return Math.max(8, Math.min(82, normalized));
  }

  return (
    <main className="w-screen h-screen bg-black text-white overflow-hidden relative">
      <section className="absolute top-0 left-0 right-0 h-[55%] bg-gradient-to-b from-zinc-950 to-black flex items-center justify-center border-b border-white/10">
        <div className="text-center opacity-70">
          <h1 className="text-5xl font-black tracking-wide">
            SURICATO ARENA
          </h1>
          <p className="text-zinc-400 mt-3 text-xl">
            Espaço da câmera / live
          </p>
        </div>
      </section>

      <section className="absolute left-0 right-0 bottom-0 h-[45%] bg-[radial-gradient(circle_at_center,rgba(100,0,150,0.28),rgba(0,0,0,0.95)_65%)] border-t-4 border-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_55%,rgba(0,180,255,0.16),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,0,0,0.16),transparent_35%)]" />

        <div className="absolute top-4 left-4 z-40 w-[280px] rounded-2xl bg-black/75 border border-white/10 backdrop-blur-md p-4">
          <h2 className="text-2xl font-black mb-3">🏆 TOP</h2>

          <div className="space-y-2">
            {players.slice(0, 3).map((player, index) => (
              <div
                key={player.name}
                className={`rounded-xl px-3 py-2 font-bold ${
                  index === 0
                    ? "bg-yellow-400 text-black"
                    : "bg-zinc-900 text-white"
                }`}
              >
                <div className="flex justify-between">
                  <span>
                    {index + 1}. {player.name}
                  </span>
                  <span>LV {player.level}</span>
                </div>

                <div className="text-sm opacity-80">
                  {player.points} pts
                </div>

                <div className="mt-1 h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, player.hp))}%`,
                      backgroundColor: hpColor(player.hp),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {projectiles.map((projectile) => {
          const fromX = arenaX(projectile.fromX);
          const fromY = arenaY(projectile.fromY);
          const toX = arenaX(projectile.toX);
          const toY = arenaY(projectile.toY);

          const dx = toX - fromX;
          const dy = toY - fromY;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const distance = Math.sqrt(dx * dx + dy * dy);

          return (
            <div
              key={projectile.id}
              className="absolute z-50 origin-left pointer-events-none"
              style={{
                left: `${fromX}%`,
                top: `${fromY}%`,
                width: `${distance}%`,
                height: 12,
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[5px] w-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${projectile.color}, ${projectile.color}, transparent)`,
                  boxShadow: `0 0 16px ${projectile.color}, 0 0 40px ${projectile.color}`,
                }}
              />

              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: projectile.color,
                  boxShadow: `0 0 20px ${projectile.color}, 0 0 60px ${projectile.color}`,
                }}
              />
            </div>
          );
        })}

        {players.map((player) => {
          const x = arenaX(player.x);
          const y = arenaY(player.y);
          const aura = AURA_COLORS[player.aura] || player.color || "#ffffff";
          const size =
            player.level >= 5
              ? 88
              : player.level === 4
              ? 78
              : player.level === 3
              ? 68
              : player.level === 2
              ? 58
              : 50;

          const isHit = hitPlayer === player.name;

          return (
            <div
              key={player.name}
              className="absolute z-30 transition-all duration-300 ease-linear"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {isHit && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-500 text-4xl font-black animate-bounce">
                  HIT!
                </div>
              )}

              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full border-4 border-white flex items-center justify-center ${
                    player.attacking ? "scale-110" : ""
                  }`}
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: player.color || "#ef4444",
                    boxShadow: `0 0 18px ${aura}, 0 0 45px ${aura}`,
                    filter: isHit ? "brightness(2)" : "none",
                  }}
                >
                  <span className="text-3xl">{iconByLevel(player.level)}</span>
                </div>

                <div className="mt-1 bg-black/80 border border-white/10 rounded-xl px-3 py-1 min-w-[90px] text-center">
                  <p className="font-black text-sm leading-tight">
                    {player.name}
                  </p>

                  <p className="text-yellow-300 text-xs font-bold">
                    {player.points} pts
                  </p>

                  <div className="mt-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, player.hp))}%`,
                        backgroundColor: hpColor(player.hp),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-purple-500/40 rounded-2xl px-8 py-3 text-2xl font-black shadow-[0_0_25px_rgba(168,85,247,0.35)]">
          {message}
        </div>
      </section>
    </main>
  );
}