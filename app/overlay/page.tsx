"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const COLORS = [
  "#ff3b3b",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#ff7b00",
];

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
      setPlayers((prev) => {
        return updatedPlayers.map((player: any, index: number) => {
          const oldPlayer = prev.find(
            (p) => p.name === player.name
          );

          return {
            ...player,
            color:
              oldPlayer?.color ??
              COLORS[index % COLORS.length],
          };
        });
      });
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
          const projectileId = Date.now() + Math.random();

          setProjectiles((prev) => [
            ...prev,
            {
              id: projectileId,
              fromX: attacker.x,
              fromY: attacker.y,
              toX: target.x,
              toY: target.y,
              color: attacker.color,
            },
          ]);

          setTimeout(() => {
            setHitPlayer(target.name);

            setTimeout(() => {
              setHitPlayer("");
            }, 250);

            setProjectiles((prev) =>
              prev.filter((p) => p.id !== projectileId)
            );
          }, 900);
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

  function monsterIcon(level: number) {
    if (level >= 5) return "👑";
    if (level === 4) return "🐉";
    if (level === 3) return "🐲";
    if (level === 2) return "👹";
    return "👾";
  }

  function monsterSize(level: number) {
    if (level >= 5) return 118;
    if (level === 4) return 108;
    if (level === 3) return 98;
    if (level === 2) return 88;
    return 76;
  }

  function hpColor(hp: number) {
    if (hp > 60) return "#22c55e";
    if (hp > 30) return "#eab308";
    return "#ef4444";
  }

  return (
    <main className="w-screen h-screen overflow-hidden relative text-white bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,40,80,0.35),rgba(0,0,0,0.92)_62%)]" />

      <div className="absolute left-6 top-6 w-[360px] z-30 rounded-3xl border border-white/15 bg-black/75 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-3xl font-black tracking-wide">
            🏆 TOP JOGADORES
          </h1>
        </div>

        <div className="p-4 space-y-3">
          {players.slice(0, 5).map((player, index) => (
            <div
              key={player.name}
              className={`rounded-2xl p-4 border ${
                index === 0
                  ? "bg-yellow-400 text-black border-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.45)]"
                  : "bg-zinc-950/90 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: player.color,
                      boxShadow: `0 0 16px ${player.color}`,
                    }}
                  >
                    {monsterIcon(player.level)}
                  </div>

                  <div>
                    <p className="font-black text-lg leading-tight">
                      {index + 1}. {player.name}
                    </p>

                    <p
                      className={
                        index === 0
                          ? "font-black"
                          : "text-yellow-300 font-black"
                      }
                    >
                      {player.points} pts
                    </p>
                  </div>
                </div>

                <div className="font-black text-sm">
                  LV {player.level}
                </div>
              </div>

              <div className="mt-3 h-3 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, player.hp)
                    )}%`,
                    backgroundColor: hpColor(player.hp),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-[410px] right-8 top-6 bottom-28 rounded-[32px] border border-white/10 bg-black/25 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,0,120,0.18),transparent_55%)]" />

        {projectiles.map((projectile) => {
          const dx = projectile.toX - projectile.fromX;
          const dy = projectile.toY - projectile.fromY;

          const angle =
            Math.atan2(dy, dx) * (180 / Math.PI);

          const distance = Math.sqrt(dx * dx + dy * dy);

          return (
            <div
              key={projectile.id}
              className="absolute z-40 pointer-events-none origin-left"
              style={{
                left: `${projectile.fromX}%`,
                top: `${projectile.fromY}%`,
                width: `${distance}%`,
                height: 14,
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[5px] w-full rounded-full"
                style={{
                  background: `linear-gradient(to right,
                    ${projectile.color},
                    ${projectile.color},
                    transparent)`,
                  boxShadow: `
                    0 0 10px ${projectile.color},
                    0 0 22px ${projectile.color},
                    0 0 42px ${projectile.color}
                  `,
                }}
              />

              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: projectile.color,
                  boxShadow: `
                    0 0 12px ${projectile.color},
                    0 0 30px ${projectile.color},
                    0 0 60px ${projectile.color}
                  `,
                }}
              />
            </div>
          );
        })}

        {players.map((player) => {
          const size = monsterSize(player.level);
          const isHit = hitPlayer === player.name;

          return (
            <div
              key={player.name}
              className="absolute z-20 transition-all duration-300 ease-linear"
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {isHit && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-red-500 text-5xl font-black animate-bounce z-50 drop-shadow-[0_0_12px_red]">
                  HIT!
                </div>
              )}

              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full border-[4px] border-white flex items-center justify-center transition-all duration-300 ${
                    player.attacking ? "scale-110" : ""
                  }`}
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: player.color,
                    boxShadow: `
                      0 0 18px ${player.color},
                      0 0 42px ${player.color},
                      0 0 80px ${player.color}
                    `,
                    filter: isHit
                      ? "brightness(2)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        player.level >= 5
                          ? 54
                          : player.level === 4
                          ? 50
                          : player.level === 3
                          ? 44
                          : player.level === 2
                          ? 38
                          : 32,
                    }}
                  >
                    {monsterIcon(player.level)}
                  </span>
                </div>

                <div className="mt-2 px-4 py-2 rounded-2xl bg-black/75 border border-white/10 min-w-[130px] text-center shadow-xl">
                  <p className="font-black text-lg leading-tight">
                    {player.name}
                  </p>

                  <p className="text-yellow-300 font-black">
                    {player.points} pts
                  </p>

                  <div className="mt-2 h-3 rounded-full bg-zinc-900 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, player.hp)
                        )}%`,
                        backgroundColor: hpColor(player.hp),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-3xl border border-red-500/40 bg-black/80 backdrop-blur-md px-12 py-5 text-3xl font-black shadow-[0_0_30px_rgba(239,68,68,0.25)]">
        {message}
      </div>
    </main>
  );
}