"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SITE_URL = "https://suricato-arena.vercel.app";

export default function DashboardPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("suricato_key");

    if (!savedKey) {
      router.push("/login");
      return;
    }

    setKey(savedKey);
  }, [router]);

  function sair() {
    localStorage.removeItem("suricato_key");
    localStorage.removeItem("suricato_logged");
    router.push("/login");
  }

  async function copiar(link: string, name: string) {
    await navigator.clipboard.writeText(link);
    setCopied(name);

    setTimeout(() => {
      setCopied("");
    }, 1800);
  }

  const links = [
    {
      title: "Rank Top 3",
      desc: "Ranking compacto para lives verticais",
      icon: "🥇",
      url: `${SITE_URL}/overlay/rank?top=3`,
      color: "#ffd700",
    },
    {
      title: "Rank Top 5",
      desc: "Ranking completo com os melhores jogadores",
      icon: "🏆",
      url: `${SITE_URL}/overlay/rank?top=5`,
      color: "#00eaff",
    },
    {
      title: "Rank Top 10",
      desc: "Ranking grande para telas maiores",
      icon: "👑",
      url: `${SITE_URL}/overlay/rank?top=10`,
      color: "#b26cff",
    },
    {
      title: "Arena Battle",
      desc: "Overlay separado da batalha em tempo real",
      icon: "⚔️",
      url: `${SITE_URL}/overlay/battle`,
      color: "#ff4d6d",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <aside style={styles.sidebar}>
        <div style={styles.brandBox}>
          <div style={styles.logo}>🦝</div>
          <div>
            <h1 style={styles.brand}>SURICATO</h1>
            <p style={styles.brandSub}>ARENA CONTROL</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <a style={styles.navItem} href="/dashboard">🏠 Dashboard</a>
          <a style={styles.navItem} href="/gifts">🎁 Presentes</a>
          <a style={styles.navItem} href="/games">🎮 Games</a>
          <a style={styles.navItem} href="/tiktok">📡 TikTok Live</a>
          <a style={styles.navItem} href="/overlay/rank" target="_blank">
            🏆 Rank
          </a>
          <a style={styles.navItem} href="/overlay/battle" target="_blank">
            ⚔️ Battle
          </a>
        </nav>

        <button style={styles.logoutButton} onClick={sair}>
          SAIR
        </button>
      </aside>

      <section style={styles.content}>
        <header style={styles.header}>
          <div>
            <p style={styles.overline}>PAINEL PROFISSIONAL</p>
            <h2 style={styles.title}>SURICATO ARENA</h2>
            <p style={styles.subtitle}>
              Copie os links e adicione no TikTok Live Studio como navegador.
            </p>
          </div>

          <div style={styles.statusCard}>
            <span style={styles.statusDot} />
            <div>
              <strong>KEY ATIVA</strong>
              <p>{key || "Carregando..."}</p>
            </div>
          </div>
        </header>

        <section style={styles.hero}>
          <div>
            <h3 style={styles.heroTitle}>Links prontos para Live Studio</h3>
            <p style={styles.heroText}>
              Use os links publicados na Vercel. Eles funcionam melhor que
              localhost no Live Studio.
            </p>
          </div>

          <div style={styles.badge}>LIVE READY</div>
        </section>

        <section style={styles.grid}>
          {links.map((item) => (
            <div key={item.title} style={styles.card}>
              <div style={styles.cardTop}>
                <div
                  style={{
                    ...styles.cardIcon,
                    boxShadow: `0 0 24px ${item.color}`,
                  }}
                >
                  {item.icon}
                </div>

                <div style={styles.livePill}>OVERLAY</div>
              </div>

              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.desc}</p>

              <div style={styles.urlBox}>{item.url}</div>

              <div style={styles.actions}>
                <button
                  style={styles.copyButton}
                  onClick={() => copiar(item.url, item.title)}
                >
                  {copied === item.title ? "COPIADO ✓" : "COPIAR LINK"}
                </button>

                <a href={item.url} target="_blank" style={styles.openButton}>
                  ABRIR
                </a>
              </div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #19245c 0%, #070817 45%, #000 100%)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    position: "relative",
    overflow: "hidden",
  },

  glowOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "rgba(0,234,255,0.18)",
    filter: "blur(80px)",
    left: "280px",
    top: "160px",
  },

  glowTwo: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "rgba(255,215,0,0.16)",
    filter: "blur(90px)",
    right: "100px",
    top: "40px",
  },

  sidebar: {
    width: "280px",
    minHeight: "100vh",
    background: "rgba(4,5,14,0.82)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    padding: "26px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
  },

  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "34px",
  },

  logo: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #ffd700, #ff7a00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    boxShadow: "0 0 24px rgba(255,215,0,0.55)",
  },

  brand: {
    margin: 0,
    color: "#ffd700",
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: "24px",
  },

  brandSub: {
    margin: "4px 0 0",
    color: "#9bdcff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "1.5px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },

  navItem: {
    textDecoration: "none",
    color: "#dff7ff",
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px",
    borderRadius: "16px",
    fontWeight: 900,
  },

  logoutButton: {
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(90deg, #ff3535, #ff8a00)",
    color: "#fff",
    fontWeight: 900,
    padding: "15px",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(255,80,0,0.45)",
  },

  content: {
    flex: 1,
    padding: "36px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
    overflowY: "auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  overline: {
    margin: 0,
    color: "#00eaff",
    fontWeight: 900,
    letterSpacing: "2px",
    fontSize: "13px",
  },

  title: {
    margin: "4px 0",
    color: "#ffd700",
    fontSize: "52px",
    fontWeight: 900,
    textShadow: "0 0 18px rgba(255,215,0,0.85)",
  },

  subtitle: {
    margin: 0,
    color: "#d7e7ff",
    fontWeight: 700,
  },

  statusCard: {
    minWidth: "240px",
    background: "rgba(255,255,255,0.075)",
    border: "1px solid rgba(0,255,174,0.4)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  statusDot: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    background: "#00ffae",
    boxShadow: "0 0 14px #00ffae",
  },

  hero: {
    background:
      "linear-gradient(90deg, rgba(255,215,0,0.15), rgba(0,234,255,0.12), rgba(255,0,120,0.12))",
    border: "1px solid rgba(255,215,0,0.28)",
    borderRadius: "28px",
    padding: "26px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    boxShadow: "0 0 26px rgba(0,234,255,0.14)",
  },

  heroTitle: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 900,
  },

  heroText: {
    margin: 0,
    color: "#d7e7ff",
    fontWeight: 700,
  },

  badge: {
    background: "linear-gradient(90deg, #00ffae, #00eaff)",
    color: "#001018",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 900,
    boxShadow: "0 0 18px rgba(0,234,255,0.7)",
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background:
      "linear-gradient(180deg, rgba(10,12,30,0.96), rgba(4,5,14,0.96))",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "28px",
    padding: "22px",
    boxShadow:
      "0 0 26px rgba(0,234,255,0.16), inset 0 0 24px rgba(255,255,255,0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
  },

  livePill: {
    color: "#00ffae",
    border: "1px solid rgba(0,255,174,0.35)",
    background: "rgba(0,255,174,0.09)",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 900,
  },

  cardTitle: {
    margin: "18px 0 8px",
    color: "#ffd700",
    fontSize: "25px",
    fontWeight: 900,
  },

  cardText: {
    margin: "0 0 16px",
    color: "#d7e7ff",
    fontWeight: 700,
  },

  urlBox: {
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "12px",
    color: "#9bdcff",
    fontSize: "12px",
    fontWeight: 700,
    wordBreak: "break-all",
    marginBottom: "16px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  copyButton: {
    flex: 1,
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(90deg, #ffd700, #ff8a00)",
    color: "#151000",
    fontWeight: 900,
    padding: "13px",
    cursor: "pointer",
  },

  openButton: {
    textDecoration: "none",
    borderRadius: "14px",
    border: "1px solid rgba(0,234,255,0.5)",
    color: "#00eaff",
    fontWeight: 900,
    padding: "13px 16px",
    background: "rgba(0,234,255,0.08)",
  },
};