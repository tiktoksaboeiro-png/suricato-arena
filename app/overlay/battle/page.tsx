"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(
  "https://consonant-iodine-caboose.ngrok-free.dev",
  {
    transports: ["websocket"],
  }
);

export default function BattleOverlay() {
  const [players, setPlayers] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("SOCKET CONNECTADO");

      addLog("SOCKET CONECTADO");
    });

    socket.on("arena:update", (data) => {
      console.log("ARENA UPDATE:", data);

      addLog(
        `UPDATE RECEBIDO: ${
          data?.players?.length || 0
        } PLAYERS`
      );

      if (data?.players) {
        setPlayers(data.players);
      }
    });

    socket.on("battle:pvpAttack", (data) => {
      addLog(
        `${data.attackerName} atacou ${data.targetName}`
      );
    });

    return () => {
      socket.off("connect");
      socket.off("arena:update");
      socket.off("battle:pvpAttack");
    };
  }, []);

  function addLog(text: string) {
    setLogs((prev) => [text, ...prev.slice(0, 6)]);
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative text-white">
      <div className="absolute top-5 left-5 z-50 bg-black/70 border border-cyan-400 rounded-3xl p-5">
        <h1 className="text-4xl font-black">
          ⚔ ARENA DEBUG
        </h1>

        <p className="text-zinc-300 mt-2">
          Players: {players.length}
        </p>
      </div>

      <div className="absolute top-5 right-5 z-50 bg-black/70 border border-yellow-400 rounded-3xl p-5 w-[350px]">
        <h2 className="font-black text-2xl mb-3">
          LOGS
        </h2>

        <div className="flex flex-col gap-2 text-sm">
          {logs.map((log, index) => (
            <div key={index}>
              • {log}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0">
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
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full overflow-hidden border-[5px] border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.9)]"
                  style={{
                    width: size,
                    height: size,
                  }}
                >
                  <img
                    src={
                      player.photo ||
                      player.avatar ||
                      "https://placehold.co/200x200/png"
                    }
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 rounded-full border-[6px] border-yellow-300 animate-ping opacity-40" />

                <p className="mt-2 font-black text-2xl">
                  {player.name}
                </p>

                <div className="w-[120px] h-[10px] bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-lime-400"
                    style={{
                      width: `${player.hp}%`,
                    }}
                  />
                </div>

                <p className="text-yellow-300 font-bold mt-1">
                  LV {player.level}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/70 border border-yellow-400 rounded-full px-10 py-4 z-50">
        <p className="font-black text-yellow-300 text-2xl">
          PVP REALTIME • DEBUG SOCKET
        </p>
      </div>
    </main>
  );
}