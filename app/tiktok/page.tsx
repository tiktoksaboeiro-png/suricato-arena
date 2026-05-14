"use client";

import Link from "next/link";
import { useState } from "react";

export default function TikTokPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("Desconectado");
  const [loading, setLoading] = useState(false);

  async function connectTikTok() {
    if (!username) {
      alert("Digite o @ da live.");
      return;
    }

    try {
      setLoading(true);

      const cleanUser = username.replace("@", "").trim();

      setStatus(`Conectando em @${cleanUser}...`);

      const response = await fetch("http://localhost:3001/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUser,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`LIVE CONECTADA: @${cleanUser}`);
      } else {
        setStatus("Erro ao conectar.");
      }
    } catch (err) {
      console.log(err);

      setStatus("Erro ao conectar na live.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_18px_rgba(255,215,0,0.9)]">
            Conectar TikTok
          </h1>

          <p className="text-zinc-400 mt-2 text-lg">
            Conecte sua live para ativar presentes, ranking e batalhas realtime.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-2xl font-bold transition-all"
        >
          Voltar
        </Link>
      </div>

      <section className="max-w-2xl bg-zinc-900/90 border border-yellow-500/30 rounded-[30px] p-8 shadow-[0_0_40px_rgba(255,215,0,0.12)]">
        <label className="font-black text-2xl text-yellow-300">
          Usuário da LIVE TikTok
        </label>

        <input
          className="mt-4 p-5 rounded-2xl bg-zinc-800 border border-zinc-700 outline-none w-full text-xl focus:border-yellow-400 transition-all"
          placeholder="Ex: @flowsaboeiro"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <p className="text-zinc-500 mt-3">
          Digite o usuário que está AO VIVO no TikTok.
        </p>

        <button
          onClick={connectTikTok}
          disabled={loading}
          className="mt-8 bg-gradient-to-r from-pink-600 to-yellow-500 hover:scale-[1.02] transition-all p-5 rounded-2xl font-black text-2xl w-full shadow-[0_0_25px_rgba(255,0,128,0.45)]"
        >
          {loading ? "CONECTANDO..." : "CONECTAR NA LIVE"}
        </button>

        <div className="mt-8 bg-black/60 border border-zinc-700 rounded-3xl p-6">
          <h2 className="font-black text-3xl mb-3 text-cyan-300">
            Status
          </h2>

          <p className="text-zinc-200 text-lg">
            {status}
          </p>
        </div>
      </section>
    </main>
  );
}