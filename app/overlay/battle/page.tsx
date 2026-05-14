"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Player = {
  id: string;
  name: string;
  photo?: string;
  points?: number;
  hp?: number;
  maxHp?: number;
  x?: number;
  y?: number;
};

type Projectile = {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  size: number;
  damage: number;
};

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

export default function BattleOverlay() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [damageTexts, setDamageTexts] = useState<
    { id: number; x: number; y: number; damage: number }[]
  >([]);

  useEffect(() => {
    socket.on("arena:update", (data: any) => {
      if (data?.players) {
        setPlayers((oldPlayers) => {
          return data.players.slice(0, 10).map((p: Player, i: number) => {
            const old = oldPlayers.find((x) => x.id === p.id);
            const start = getStartPosition(i);

            return {
              ...p,
              x: old?.x ?? p.x ?? start.x,
              y: old?.y ?? p.y ?? start.y,
              hp: old?.hp ?? p.hp ?? 100,
              maxHp: p.maxHp ?? 100,
            };
          });
        });
      }
    });

    socket.on("battle:damage", (data: any) => {
      setPlayers((current) => {
        if (current.length < 2) return current;

        const attacker =
          current.find((p) => p.id === data.user) ||
          current[Math.floor(Math.random() * current.length)];

        const possibleTargets = current.filter((p) => p.id !== attacker.id);
        const target =
          possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        const damage = Number(data.damage || 1);
        const colors = ["#00eaff", "#ffd700", "#ff2bd6", "#00ff88", "#ff5a00"];

        const projectile: Projectile = {
          id: Date.now() + Math.random(),
          fromX: attacker.x || 50,
          fromY: attacker.y || 50,
          toX: target.x || 50,
          toY: target.y || 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: getProjectileSize(attacker.points || 0),
          damage,
        };

        setProjectiles((old) => [...old, projectile]);

        setDamageTexts((old) => [
          ...old,
          {
            id: projectile.id,
            x: target.x || 50,
            y: target.y || 50,
            damage,
          },
        ]);

        setTimeout(() => {
          setProjectiles((old) => old.filter((p) => p.id !== projectile.id));
          setDamageTexts((old) => old.filter((p) => p.id !== projectile.id));
        }, 900);

        return current.map((p) => {
          if (p.id !== target.id) return p;

          const hpDamage = Math.max(3, Math.floor(damage / 20));
          const newHp = Math.max(0, (p.hp ?? 100) - hpDamage);

          return {
            ...p,
            hp: newHp <= 0 ? 100 : newHp,
          };
        });
      });
    });

    return () => {
      socket.off("arena:update");
      socket.off("battle:damage");
    };
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPlayers((current) =>
        current.map((p) => ({
          ...p,
          x: clamp((p.x || 50) + (Math.random() * 12 - 6), 10, 90),
          y: clamp((p.y || 50) + (Math.random() * 10 - 5), 24, 82),
        }))
      );
    }, 1200);

    return () => clearInterval(moveInterval);
  }, []);

  const topPlayers = [...players]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  const topOneId = topPlayers[0]?.id;

  return (
    <>
      <style jsx global>{`
        html,
        body,
        #__next {
          margin: 0 !important;
          padding: 0 !important;
          background: #02030a !important;
          overflow: hidden !important;
        }

        @keyframes powerMove {
          0% {
            left: var(--fromX);
            top: var(--fromY);
            opacity: 1;
            transform: scale(0.7);
          }

          100% {
            left: var(--toX);
            top: var(--toY);
            opacity: 0;
            transform: scale(1.8);
          }
        }

        @keyframes damagePop {
          0% {
            transform: translate(-50%, 0) scale(0.8);
            opacity: 0;
          }

          35% {
            transform: translate(-50%, -18px) scale(1.2);
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -55px) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      <main style={styles.page}>
        <div style={styles.hudLeft}>
          <strong>⚔️ ARENA PVP</strong>
          <span>Players evoluem com presentes</span>
        </div>

        <div style={styles.rankBox}>
          <strong>TOP 5</strong>
          {topPlayers.map((p, i) => (
            <span key={p.id}>
              {i + 1}. {shortName(p.name)} {(p.points || 0).toLocaleString()}
            </span>
          ))}
        </div>

        {players.slice(0, 10).map((player) => {
          const power = getPowerVisual(player.points || 0, player.id === topOneId);

          return (
            <div
              key={player.id}
              style={{
                ...styles.player,
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: `translate(-50%, -50%) scale(${power.scale})`,
                zIndex: player.id === topOneId ? 40 : 15,
              }}
            >
              {player.id === topOneId && <div style={styles.topBadge}>TOP 1</div>}

              <div
                style={{
                  ...styles.avatarWrap,
                  boxShadow: power.aura,
                  background: power.border,
                }}
              >
                <img
                  src={player.photo || "/default-avatar.png"}
                  alt={player.name}
                  style={styles.avatar}
                />
              </div>

              <div style={styles.name}>{shortName(player.name)}</div>

              <div style={styles.levelText}>LV {getLevel(player.points || 0)}</div>

              <div style={styles.hpBar}>
                <div
                  style={{
                    ...styles.hpFill,
                    width: `${Math.max(
                      0,
                      Math.min(100, ((player.hp ?? 100) / (player.maxHp ?? 100)) * 100)
                    )}%`,
                    background:
                      (player.hp ?? 100) < 30
                        ? "linear-gradient(90deg, #ff003c, #ff7a00)"
                        : "linear-gradient(90deg, #00ff66, #baff00)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {projectiles.map((p) => (
          <div
            key={p.id}
            style={
              {
                ...styles.projectile,
                width: `${p.size}px`,
                height: `${p.size}px`,
                "--fromX": `${p.fromX}%`,
                "--fromY": `${p.fromY}%`,
                "--toX": `${p.toX}%`,
                "--toY": `${p.toY}%`,
                background: p.color,
                boxShadow: `0 0 22px ${p.color}, 0 0 55px ${p.color}`,
              } as React.CSSProperties
            }
          />
        ))}

        {damageTexts.map((d) => (
          <div
            key={d.id}
            style={{
              ...styles.damageText,
              left: `${d.x}%`,
              top: `${d.y}%`,
            }}
          >
            -{d.damage}
          </div>
        ))}

        <div style={styles.bottomText}>
          QUANTO MAIS PRESENTES • MAIOR O PLAYER • MAIS FORTE A AURA
        </div>
      </main>
    </>
  );
}

function shortName(name: string) {
  if (!name) return "Player";
  return name.length > 9 ? name.slice(0, 9) + "..." : name;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLevel(points: number) {
  return Math.floor(points / 1000) + 1;
}

function getProjectileSize(points: number) {
  if (points >= 15000) return 42;
  if (points >= 5000) return 32;
  if (points >= 1000) return 26;
  return 20;
}

function getPowerVisual(points: number, isTopOne: boolean) {
  if (isTopOne) {
    return {
      scale: 1.55,
      aura:
        "0 0 35px rgba(255,215,0,1), 0 0 70px rgba(255,0,120,0.9), 0 0 100px rgba(0,234,255,0.7)",
      border: "linear-gradient(135deg, #ffd700, #ff2bd6, #00eaff)",
    };
  }

  if (points >= 15000) {
    return {
      scale: 1.45,
      aura:
        "0 0 35px rgba(255,215,0,1), 0 0 65px rgba(255,215,0,0.75)",
      border: "linear-gradient(135deg, #fff07a, #ffb300, #ff7a00)",
    };
  }

  if (points >= 5000) {
    return {
      scale: 1.25,
      aura: "0 0 30px rgba(0,234,255,0.95), 0 0 55px rgba(0,234,255,0.55)",
      border: "linear-gradient(135deg, #00eaff, #0077ff)",
    };
  }

  if (points >= 1000) {
    return {
      scale: 1.12,
      aura: "0 0 22px rgba(0,255,136,0.8)",
      border: "linear-gradient(135deg, #00ff88, #00eaff)",
    };
  }

  return {
    scale: 1,
    aura: "0 0 16px rgba(0,234,255,0.55)",
    border: "linear-gradient(135deg, #00eaff, #ffd700, #ff2bd6)",
  };
}

function getStartPosition(index: number) {
  const positions = [
    { x: 18, y: 34 },
    { x: 32, y: 55 },
    { x: 48, y: 38 },
    { x: 66, y: 58 },
    { x: 82, y: 36 },
    { x: 24, y: 75 },
    { x: 44, y: 78 },
    { x: 62, y: 74 },
    { x: 78, y: 77 },
    { x: 50, y: 62 },
  ];

  return positions[index] || { x: 50, y: 50 };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    background:
      "radial-gradient(circle at center, #171020 0%, #080914 45%, #000 100%)",
    overflow: "hidden",
    position: "relative",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  hudLeft: {
    position: "absolute",
    top: "18px",
    left: "18px",
    background: "rgba(0,0,0,0.65)",
    border: "1px solid rgba(0,234,255,0.45)",
    borderRadius: "18px",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    boxShadow: "0 0 22px rgba(0,234,255,0.25)",
    zIndex: 50,
  },

  rankBox: {
    position: "absolute",
    top: "18px",
    right: "18px",
    background: "rgba(0,0,0,0.65)",
    border: "1px solid rgba(255,215,0,0.45)",
    borderRadius: "18px",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: "210px",
    fontSize: "13px",
    zIndex: 50,
  },

  player: {
    position: "absolute",
    width: "86px",
    textAlign: "center",
    transition: "left 1s ease, top 1s ease, transform 0.5s ease",
  },

  topBadge: {
    marginBottom: "4px",
    background: "linear-gradient(90deg, #ffd700, #ff7a00)",
    color: "#1b1000",
    borderRadius: "999px",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: 900,
    boxShadow: "0 0 16px rgba(255,215,0,0.9)",
  },

  avatarWrap: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    padding: "4px",
    margin: "0 auto",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    background: "#111",
  },

  name: {
    marginTop: "5px",
    fontSize: "12px",
    fontWeight: 900,
    textShadow: "0 2px 6px #000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  levelText: {
    marginTop: "2px",
    color: "#ffd700",
    fontSize: "10px",
    fontWeight: 900,
    textShadow: "0 2px 6px #000",
  },

  hpBar: {
    width: "68px",
    height: "8px",
    background: "rgba(0,0,0,0.85)",
    margin: "4px auto 0",
    borderRadius: "999px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.35)",
  },

  hpFill: {
    height: "100%",
    transition: "width 0.35s ease",
  },

  projectile: {
    position: "absolute",
    borderRadius: "50%",
    zIndex: 30,
    animation: "powerMove 0.9s ease-out forwards",
  },

  damageText: {
    position: "absolute",
    color: "#ff3366",
    fontSize: "28px",
    fontWeight: 900,
    textShadow: "0 3px 8px #000",
    animation: "damagePop 0.9s ease-out forwards",
    zIndex: 35,
  },

  bottomText: {
    position: "absolute",
    bottom: "18px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.65)",
    border: "1px solid rgba(255,215,0,0.4)",
    color: "#ffd700",
    borderRadius: "999px",
    padding: "10px 18px",
    fontWeight: 900,
    fontSize: "13px",
    letterSpacing: "1px",
    zIndex: 50,
  },
};