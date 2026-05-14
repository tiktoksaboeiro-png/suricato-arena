"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type GiftConfig = {
  name: string;
  action: string;
  power: number;
  xp: number;
  hp: number;
  energy: number;
  visual: string;
};

export default function StartPage() {
  const [gifts, setGifts] = useState<GiftConfig[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("suricato_gifts");

    if (saved) {
      setGifts(JSON.parse(saved));
    }

    const gameStarted = localStorage.getItem("suricato_game_started");
    setStarted(gameStarted === "true");
  }, []);

  function startGame() {
    localStorage.setItem("suricato_game_started", "true");
    setStarted(true);
    alert("Arena iniciada!");
  }

  function stopGame() {
    localStorage.setItem("suricato_game_started", "false");
    setStarted(false);
    alert("Arena pausada!");
  }

  function copyOverlayLink() {
    navigator.clipboard.writeText("http://localhost:3000/overlay");
    alert("Link do overlay copiado!");
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black">Iniciar Arena</h1>
          <p className="text-zinc-400 mt-2">
            Revise os presentes e inicie o jogo da live.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-bold"
        >
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <h2 className="text-3xl font-black mb-4">Status</h2>

          <div
            className={`p-5 rounded-2xl font-black text-xl ${
              started
                ? "bg-green-500 text-black"
                : "bg-yellow-500 text-black"
            }`}
          >
            {started ? "ARENA ATIVA" : "ARENA PARADA"}
          </div>

          <div className="grid gap-4 mt-6">
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-400 text-black p-4 rounded-xl font-black text-xl"
            >
              INICIAR ARENA
            </button>

            <button
              onClick={stopGame}
              className="bg-red-500 hover:bg-red-400 p-4 rounded-xl font-black text-xl"
            >
              PARAR ARENA
            </button>

            <Link
              href="/overlay"
              target="_blank"
              className="bg-blue-500 hover:bg-blue-400 p-4 rounded-xl font-black text-xl text-center"
            >
              ABRIR OVERLAY
            </Link>

            <button
              onClick={copyOverlayLink}
              className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-black text-xl"
            >
              COPIAR LINK DO OVERLAY
            </button>
          </div>
        </section>

        <section className="lg:col-span-2 bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black">
              Presentes Configurados
            </h2>

            <Link
              href="/gifts"
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl font-bold"
            >
              Editar
            </Link>
          </div>

          <div className="grid gap-4">
            {gifts.map((gift, index) => (
              <div
                key={index}
                className="bg-black/60 border border-zinc-700 rounded-2xl p-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">{gift.name}</h3>
                    <p className="text-zinc-300">Ação: {gift.action}</p>
                    <p className="text-zinc-300">Poder: {gift.power}</p>
                    <p className="text-zinc-300">XP: {gift.xp}</p>
                    <p className="text-zinc-300">HP: {gift.hp}</p>
                    <p className="text-zinc-300">Energia: {gift.energy}</p>
                    <p className="text-zinc-300">Visual: {gift.visual}</p>
                  </div>

                  <div className="text-4xl">🎁</div>
                </div>
              </div>
            ))}

            {gifts.length === 0 && (
              <div className="bg-black/60 border border-yellow-500/40 rounded-2xl p-6">
                <p className="text-yellow-300 font-bold">
                  Nenhum presente configurado ainda.
                </p>

                <Link
                  href="/gifts"
                  className="inline-block mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-black"
                >
                  CONFIGURAR PRESENTES
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}