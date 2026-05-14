"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ArenaConfigPage() {
  const [minutes, setMinutes] = useState(15);
  const [bossHp, setBossHp] = useState(10000);
  const [topPlayers, setTopPlayers] = useState(5);
  const [likeMultiplier, setLikeMultiplier] = useState(1);
  const [giftMultiplier, setGiftMultiplier] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("suricato_arena_config");

    if (savedConfig) {
      const config = JSON.parse(savedConfig);

      setMinutes(config.minutes || 15);
      setBossHp(config.bossHp || 10000);
      setTopPlayers(config.topPlayers || 5);
      setLikeMultiplier(config.likeMultiplier || 1);
      setGiftMultiplier(config.giftMultiplier || 10);
    }
  }, []);

  function saveConfig() {
    const now = Date.now();
    const endTime = now + minutes * 60 * 1000;

    const config = {
      minutes,
      bossHp,
      topPlayers,
      likeMultiplier,
      giftMultiplier,
      arenaStartedAt: now,
      arenaEndTime: endTime,
    };

    localStorage.setItem("suricato_arena_config", JSON.stringify(config));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
            CONFIGURAÇÃO DA ARENA
          </h1>

          <p className="text-zinc-400 mt-3 text-lg">
            Controle total da rodada da SURICATO ARENA.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-2xl font-bold"
        >
          Voltar
        </Link>
      </div>

      <section className="max-w-3xl bg-zinc-900/90 border border-yellow-500/20 rounded-[30px] p-8 shadow-[0_0_40px_rgba(255,215,0,0.12)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-black text-xl text-yellow-300">
              Tempo da Arena (min)
            </label>

            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-xl"
            />
          </div>

          <div>
            <label className="font-black text-xl text-red-400">
              HP do Boss
            </label>

            <input
              type="number"
              value={bossHp}
              onChange={(e) => setBossHp(Number(e.target.value))}
              className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-xl"
            />
          </div>

          <div>
            <label className="font-black text-xl text-cyan-300">
              Top Ranking
            </label>

            <input
              type="number"
              value={topPlayers}
              onChange={(e) => setTopPlayers(Number(e.target.value))}
              className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-xl"
            />
          </div>

          <div>
            <label className="font-black text-xl text-pink-400">
              Multiplicador Likes
            </label>

            <input
              type="number"
              value={likeMultiplier}
              onChange={(e) => setLikeMultiplier(Number(e.target.value))}
              className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-xl"
            />
          </div>

          <div>
            <label className="font-black text-xl text-green-400">
              Multiplicador Gifts
            </label>

            <input
              type="number"
              value={giftMultiplier}
              onChange={(e) => setGiftMultiplier(Number(e.target.value))}
              className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-xl"
            />
          </div>
        </div>

        <button
          onClick={saveConfig}
          className="mt-10 w-full bg-gradient-to-r from-pink-600 to-yellow-500 hover:scale-[1.02] transition-all p-5 rounded-2xl text-2xl font-black shadow-[0_0_30px_rgba(255,0,128,0.4)]"
        >
          SALVAR E INICIAR RODADA
        </button>

        {saved && (
          <div className="mt-6 bg-green-500/20 border border-green-400 rounded-2xl p-4 text-green-300 font-bold text-center">
            Rodada iniciada e configurações salvas com sucesso.
          </div>
        )}
      </section>
    </main>
  );
}