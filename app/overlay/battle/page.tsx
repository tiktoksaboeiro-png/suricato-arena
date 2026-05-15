"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(
  "https://consonant-iodine-caboose.ngrok-free.dev",
  {
    transports: ["websocket"],
  }
);

type Player = {
  id: string;
  name: string;
  photo?: string;
  avatar?: string;
  points?: number;
  level?: number;
  hp?: number;
  x?: number;
  y?: number;
  alive?: boolean;
  eliminated?: boolean;
};

type Attack = {
  id: number;
  attackerId: string;
  targetId: string;
  damage: number;
  type: "like" | "gift";
  color: string;
  size: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export default function BattleOverlay() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [champion, setChampion] = useState<any>(null);

  useEffect(() => {
    socket.on("arena:update", (data: any) => {
      if (data?.players) {
        setPlayers(data.players);
      }

      if (data?.champion) {
        setChampion(data.champion);
      }
    });

    socket.on("battle:pvpAttack", (data: any) => {
      const id = Date.now() + Math.random();

      setAttacks((old) => [
        ...old,
        {
          id,
          ...data,
        },
      ]);

      setTimeout(() => {
        setAttacks((old) =>
          old.filter((a) => a.id !== id)
        );
      }, 900);
    });

    socket.on("battle:champion", (data: any) => {
      setChampion(data.champion);
    });

    return () => {
      socket.off("arena:update");
      socket.off("battle:pvpAttack");
      socket.off("battle:champion");
    };
  }, []);

  const alivePlayers = players.filter(
    (player) =>
      player.alive !== false &&
      !player.eliminated
  );

  const sortedPlayers = [...alivePlayers].sort(
    (a, b) =>
      (b.points || 0) - (a.points || 0)
  );

  const top1Id = sortedPlayers[0]?.id;

  return (
    <>
      <style jsx global>{`
        html,
        body,
        #__next {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: black;
        }

        @keyframes powerFly {
          0% {
            left: var(--fromX);
            top: var(--fromY);
            transform: translate(-50%, -50%)
              scale(0.5);
            opacity: 1;
          }

          100% {
            left: var(--toX);
            top: var(--toY);
            transform: translate(-50%, -50%)
              scale(1.6);
            opacity: 0;
          }
        }

        @keyframes championPulse {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <main style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            ⚔ ARENA SURICATO
          </h1>

          <p style={styles.subtitle}>
            Battle Royale realtime
          </p>
        </div>

        <div style={styles.rankBox}>
          <div style={styles.rankTitle}>
            TOP 5
          </div>

          {sortedPlayers
            .slice(0, 5)
            .map((player, index) => (
              <div
                key={player.id}
                style={styles.rankItem}
              >
                <span>
                  {index + 1}.{" "}
                  {shortName(player.name)}
                </span>

                <span>
                  {player.points || 0}
                </span>
              </div>
            ))}
        </div>

        {champion && (
          <div style={styles.championBox}>
            🏆 CAMPEÃO:{" "}
            {shortName(champion.name)}
          </div>
        )}

        {alivePlayers.map((player) => {
          const isTop1 =
            player.id === top1Id;

          const power = getPlayerPower(
            player.points || 0,
            isTop1
          );

          return (
            <div
              key={player.id}
              style={{
                ...styles.player,
                left: `${player.x || 50}%`,
                top: `${player.y || 50}%`,
                transform: `translate(-50%, -50%) scale(${power.scale})`,
                zIndex: isTop1 ? 40 : 20,
              }}
            >
              {isTop1 && (
                <div
                  style={
                    styles.legendaryAura
                  }
                />
              )}

              <div
                style={{
                  ...styles.avatarBox,
                  borderColor:
                    power.border,
                  boxShadow:
                    power.shadow,
                }}
              >
                <img
                  src={
                    player.photo ||
                    player.avatar ||
                    "/default-avatar.png"
                  }
                  alt={player.name}
                  style={styles.avatar}
                />
              </div>

              <div style={styles.name}>
                {shortName(player.name)}
              </div>

              <div style={styles.hpBar}>
                <div
                  style={{
                    ...styles.hpFill,
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        player.hp || 0
                      )
                    )}%`,
                  }}
                />
              </div>

              <div style={styles.level}>
                LV {player.level || 1}
              </div>

              {isTop1 && (
                <div
                  style={
                    styles.legendaryText
                  }
                >
                  LENDÁRIO
                </div>
              )}
            </div>
          );
        })}

        {attacks.map((attack) => (
          <div
            key={attack.id}
            style={
              {
                ...styles.powerBall,
                "--fromX": `${attack.fromX}%`,
                "--fromY": `${attack.fromY}%`,
                "--toX": `${attack.toX}%`,
                "--toY": `${attack.toY}%`,
                width: `${attack.size}px`,
                height: `${attack.size}px`,
                background:
                  attack.color,
                boxShadow: `0 0 25px ${attack.color}`,
              } as React.CSSProperties
            }
          />
        ))}

        <div style={styles.footer}>
          LIKES = ATAQUES • GIFTS =
          PODERES • TOP 1 = LENDÁRIO
        </div>
      </main>
    </>
  );
}

function shortName(name: string) {
  if (!name) return "Player";

  if (name.length > 10) {
    return name.slice(0, 10) + "...";
  }

  return name;
}

function getPlayerPower(
  points: number,
  top1: boolean
) {
  if (top1) {
    return {
      scale: 1.55,
      border: "#ffd700",
      shadow:
        "0 0 35px #ffd700, 0 0 80px #ff9900",
    };
  }

  if (points >= 10000) {
    return {
      scale: 1.35,
      border: "#ff00ff",
      shadow:
        "0 0 30px #ff00ff",
    };
  }

  if (points >= 5000) {
    return {
      scale: 1.2,
      border: "#00eaff",
      shadow:
        "0 0 25px #00eaff",
    };
  }

  return {
    scale: 1,
    border: "#00eaff",
    shadow:
      "0 0 18px #00eaff",
  };
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width: "100vw",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at center, #161616 0%, #000000 70%)",
    fontFamily: "Arial",
    color: "white",
  },

  header: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 100,
    background:
      "rgba(0,0,0,0.65)",
    padding: "18px 24px",
    borderRadius: 24,
    border:
      "1px solid rgba(0,234,255,0.4)",
  },

  title: {
    margin: 0,
    fontSize: 44,
    fontWeight: 900,
  },

  subtitle: {
    marginTop: 6,
    color: "#cccccc",
    fontWeight: 700,
  },

  rankBox: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 240,
    zIndex: 100,
    background:
      "rgba(0,0,0,0.65)",
    border:
      "1px solid rgba(255,215,0,0.5)",
    borderRadius: 24,
    padding: 18,
  },

  rankTitle: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 14,
    color: "#ffd700",
  },

  rankItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontWeight: 700,
  },

  player: {
    position: "absolute",
    transition:
      "left 0.8s linear, top 0.8s linear, transform 0.3s",
    textAlign: "center",
  },

  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #00eaff",
    background: "#111",
  },

  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  name: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 900,
    textShadow:
      "0 0 8px rgba(0,0,0,0.9)",
  },

  hpBar: {
    width: 80,
    height: 8,
    background: "#222",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },

  hpFill: {
    height: "100%",
    background:
      "linear-gradient(90deg,#00ff66,#bbff00)",
  },

  level: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 900,
    color: "#ffd700",
  },

  legendaryAura: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: "50%",
    background:
      "rgba(255,215,0,0.25)",
    filter: "blur(40px)",
    left: "50%",
    top: "50%",
    transform:
      "translate(-50%,-50%)",
    animation:
      "championPulse 1.5s infinite",
    zIndex: -1,
  },

  legendaryText: {
    marginTop: 4,
    fontSize: 10,
    color: "#ffd700",
    fontWeight: 900,
    letterSpacing: 2,
  },

  powerBall: {
    position: "absolute",
    borderRadius: "50%",
    animation:
      "powerFly 0.9s linear forwards",
    zIndex: 80,
    pointerEvents: "none",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background:
      "rgba(0,0,0,0.65)",
    border:
      "1px solid rgba(255,215,0,0.4)",
    borderRadius: 999,
    padding: "14px 28px",
    fontWeight: 900,
    color: "#ffd700",
    zIndex: 100,
  },

  championBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform:
      "translate(-50%, -50%)",
    fontSize: 64,
    fontWeight: 900,
    color: "#ffd700",
    textShadow:
      "0 0 25px rgba(255,215,0,1)",
    zIndex: 200,
    pointerEvents: "none",
  },
};