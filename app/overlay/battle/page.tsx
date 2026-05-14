"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(
  "https://consonant-iodine-caboose.ngrok-free.dev",
  {
    transports: ["websocket"],
  }
);

interface Player {
  id: number;
  name: string;
  points: number;
  level: number;
  avatar: string;
  x: number;
  y: number;
  hp: number;
}

export default function BattleOverlay() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [bossHp, setBossHp] = useState(10000);

  useEffect(() => {
    socket.on("arenaUpdate", (data) => {
      if (data.players) {
        setPlayers(data.players);
      }

      if (data.bossHp !== undefined) {
        setBossHp(data.bossHp);
      }
    });

    return () => {
      socket.off("arenaUpdate");
    };
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black relative text-white">
      <div className="absolute top-6 left-6 bg-black/70 border border-cyan-400 rounded-3xl px-6 py-4 z-50">
        <h1 className="font-black text-4xl text-white">
          ⚔ ARENA PVP
        </h1>

        <p className="text-zinc-300 text-xl">
          Jogadores se atacando
        </p>
      </div>

      <div className="absolute top-8 right-8 bg-black/70 border border-yellow-400 rounded-3xl p-5 w-[220px] z-50">
        <h2 className="font-black text-3xl mb-4 text-white">
          TOP 5
        </h2>

        {players
          .sort((a, b) => b.points - a.points)
          .slice(0, 5)
          .map((player, index) => (
            <div
              key={player.id}
              className="flex justify-between text-lg mb-2"
            >
              <span>
                {index + 1}. {player.name.slice(0, 10)}
              </span>

              <span>{player.points}</span>
            </div>
          ))}
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40">
        <h1 className="text-[110px] font-black text-white opacity-90 drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]">
          BOSS SURICATO
        </h1>

        <div className="w-[800px] h-[36px] border-4 border-white rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-400 transition-all duration-500"
            style={{
              width: `${(bossHp / 10000) * 100}%`,
            }}
          />
        </div>

        <p className="text-center text-3xl font-black mt-3">
          {bossHp.toLocaleString()} HP
        </p>
      </div>

      {players.map((player) => {
        const size =
          90 + Math.min(player.points / 1000, 120);

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-1000"
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="rounded-full border-[5px] border-cyan-400 overflow-hidden shadow-[0_0_25px_rgba(0,255,255,0.9)]"
                style={{
                  width: size,
                  height: size,
                }}
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute inset-0 rounded-full border-[6px] border-yellow-300 animate-ping opacity-40" />

              <div className="mt-2 text-center">
                <p className="font-black text-2xl drop-shadow-lg">
                  {player.name.slice(0, 10)}
                </p>

                <p className="text-yellow-300 font-bold text-lg">
                  LV {player.level}
                </p>
              </div>

              <div className="w-[120px] h-[12px] bg-zinc-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-lime-400"
                  style={{
                    width: `${player.hp}%`,
                  }}
                />
              </div>

              <div className="absolute top-1/2 left-full w-[120px] h-[8px] bg-gradient-to-r from-cyan-400 to-pink-500 blur-[2px] animate-pulse" />
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 border border-yellow-400 rounded-full px-10 py-4 z-50">
        <p className="font-black text-yellow-300 text-2xl">
          PLAYERS ANDANDO • ATAQUES PVP • PODERES AUTOMÁTICOS
        </p>
      </div>
    </main>
  );
}