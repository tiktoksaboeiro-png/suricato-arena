"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Player = {
  id: string;
  name: string;
  photo?: string;
  hp?: number;
  maxHp?: number;
  x?: number;
  y?: number;
};

type Monster = {
  name: string;
  hp: number;
  maxHp: number;
  image?: string;
};

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
);

export default function BattleOverlay() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [damageText, setDamageText] = useState<string | null>(null);

  useEffect(() => {
    socket.on("arena:update", (data: any) => {
      if (data?.players) {
        setPlayers(data.players);
      }

      if (data?.monster) {
        setMonster(data.monster);
      }
    });

    socket.on("battle:damage", (data: any) => {
      setDamageText(`-${data.damage}`);

      setTimeout(() => {
        setDamageText(null);
      }, 700);
    });

    return () => {
      socket.off("arena:update");
      socket.off("battle:damage");
    };
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.battlefield}>
        {monster && (
          <div style={styles.monsterArea}>
            <img
              src={monster.image || "/monsters/default.png"}
              alt={monster.name}
              style={styles.monster}
            />

            {damageText && (
              <div style={styles.damage}>
                {damageText}
              </div>
            )}

            <div style={styles.monsterName}>
              {monster.name}
            </div>

            <div style={styles.hpBar}>
              <div
                style={{
                  ...styles.hpFill,
                  width: `${Math.max(
                    0,
                    Math.min(100, (monster.hp / monster.maxHp) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {players.map((player, index) => (
          <div
            key={player.id}
            style={{
              ...styles.player,
              left: `${player.x ?? 18 + index * 15}%`,
              bottom: `${player.y ?? 10}%`,
            }}
          >
            <img
              src={player.photo || "/default-avatar.png"}
              alt={player.name}
              style={styles.avatar}
            />

            <div style={styles.playerName}>
              {player.name}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "transparent",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Arial, sans-serif",
  },

  battlefield: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  monsterArea: {
    position: "absolute",
    left: "50%",
    top: "40%",
    transform: "translate(-50%, -50%)",
    width: "clamp(250px, 40vw, 520px)",
    textAlign: "center",
  },

  monster: {
    width: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 0 30px rgba(255,0,80,0.8))",
  },

  monsterName: {
    marginTop: "10px",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "clamp(22px, 4vw, 48px)",
    textShadow: "0 4px 12px rgba(0,0,0,0.9)",
  },

  hpBar: {
    width: "100%",
    height: "22px",
    marginTop: "10px",
    background: "rgba(0,0,0,0.7)",
    borderRadius: "999px",
    overflow: "hidden",
    border: "2px solid #ffffff",
  },

  hpFill: {
    height: "100%",
    background: "linear-gradient(90deg,#ff003c,#ffcc00)",
    transition: "width 0.3s ease",
  },

  damage: {
    position: "absolute",
    left: "50%",
    top: "5%",
    transform: "translateX(-50%)",
    color: "#ff2f2f",
    fontWeight: 900,
    fontSize: "clamp(40px, 8vw, 90px)",
    textShadow: "0 5px 12px rgba(0,0,0,0.9)",
    pointerEvents: "none",
  },

  player: {
    position: "absolute",
    transform: "translateX(-50%)",
    width: "clamp(60px, 8vw, 110px)",
    textAlign: "center",
  },

  avatar: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00eaff",
    boxShadow: "0 0 20px rgba(0,234,255,0.8)",
  },

  playerName: {
    marginTop: "5px",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "clamp(10px, 1.6vw, 18px)",
    textShadow: "0 2px 8px rgba(0,0,0,0.9)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};