"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZNTh7RPiIOUqnqXPeCshW6SrZtHsE40MhFO154ADc-00LTmXynyung336ahyyXhZH9w/exec";

export default function LoginPage() {
  const router = useRouter();

  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");

    if (!key.trim()) {
      setErro("Digite sua key de acesso.");
      return;
    }

    setLoading(true);

    try {
      const url = `${APPS_SCRIPT_URL}?key=${encodeURIComponent(
        key.trim()
      )}&pc=SITE`;

      const response = await fetch(url);
      const result = await response.text();

      if (
        result.includes("ATIVADA") ||
        result.includes("LIBERADA") ||
        result.includes("BLOQUEADA")
      ) {
        localStorage.setItem("suricato_key", key.trim());
        router.push("/dashboard");
        return;
      }

      setErro("Key inválida.");
    } catch {
      setErro("Erro ao validar key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🦝</div>

        <h1 style={styles.title}>SURICATO ARENA</h1>
        <p style={styles.subtitle}>Digite sua key para entrar</p>

        <input
          style={styles.input}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Ex: SURI-1234"
        />

        {erro && <div style={styles.erro}>{erro}</div>}

        <button style={styles.button} onClick={entrar} disabled={loading}>
          {loading ? "VALIDANDO..." : "ENTRAR NA ARENA"}
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    background:
      "radial-gradient(circle at top, #1b2350 0%, #050712 55%, #000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "90%",
    maxWidth: "430px",
    background: "rgba(8,10,24,0.94)",
    border: "2px solid rgba(255,215,0,0.8)",
    borderRadius: "28px",
    padding: "32px",
    textAlign: "center",
    boxShadow: "0 0 35px rgba(255,215,0,0.45)",
  },
  logo: {
    fontSize: "54px",
    marginBottom: "8px",
  },
  title: {
    color: "#ffd700",
    fontSize: "34px",
    fontWeight: 900,
    margin: 0,
  },
  subtitle: {
    color: "#ffffff",
    opacity: 0.85,
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    height: "52px",
    borderRadius: "16px",
    border: "2px solid rgba(255,215,0,0.6)",
    background: "#050712",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 800,
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box",
  },
  erro: {
    marginTop: "14px",
    color: "#ff4d4d",
    fontWeight: 800,
  },
  button: {
    width: "100%",
    height: "54px",
    marginTop: "22px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(90deg, #ffd700, #ff9d00)",
    color: "#111",
    fontWeight: 900,
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(255,215,0,0.6)",
  },
};