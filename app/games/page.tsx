"use client";

import Link from "next/link";

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mb-12">
        <h1 className="text-5xl font-black">Jogos da Arena</h1>

        <p className="text-zinc-400 mt-3 text-lg">
          Escolha o modo de jogo que será usado na live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-900 border border-green-500 rounded-3xl p-8 shadow-2xl">
          <div className="text-6xl mb-6">⚔️</div>

          <h2 className="text-3xl font-black mb-4">
            Arena Battle
          </h2>

          <p className="text-zinc-400 mb-6">
            Jogadores entram na arena e batalham automaticamente usando presentes da live.
          </p>

          <div className="grid gap-3 text-zinc-300 mb-8">
            <p>✅ Ranking em tempo real</p>
            <p>✅ Poderes por presentes</p>
            <p>✅ Evolução de monstro</p>
            <p>✅ Sistema de ataques</p>
          </div>

          <Link
            href="/start"
            className="block text-center bg-green-500 hover:bg-green-400 text-black p-4 rounded-2xl font-black text-xl"
          >
            ENTRAR NA ARENA
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 opacity-70">
          <div className="text-6xl mb-6">🏰</div>

          <h2 className="text-3xl font-black mb-4">
            Boss Raid
          </h2>

          <p className="text-zinc-400 mb-6">
            Todos os viewers atacam um boss gigante juntos.
          </p>

          <div className="grid gap-3 text-zinc-300 mb-8">
            <p>⏳ Em desenvolvimento</p>
            <p>⏳ Bosses lendários</p>
            <p>⏳ Loot especial</p>
            <p>⏳ Eventos de raid</p>
          </div>

          <button className="w-full bg-zinc-800 p-4 rounded-2xl font-black text-xl cursor-not-allowed">
            EM BREVE
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 opacity-70">
          <div className="text-6xl mb-6">🎁</div>

          <h2 className="text-3xl font-black mb-4">
            Pote de Presentes
          </h2>

          <p className="text-zinc-400 mb-6">
            Presentes caem dentro de um pote transparente na live.
          </p>

          <div className="grid gap-3 text-zinc-300 mb-8">
            <p>⏳ Presentes caindo</p>
            <p>⏳ Meta da live</p>
            <p>⏳ Evento especial</p>
            <p>⏳ Boss automático</p>
          </div>

          <button className="w-full bg-zinc-800 p-4 rounded-2xl font-black text-xl cursor-not-allowed">
            EM BREVE
          </button>
        </div>
      </div>

      <div className="mt-12">
        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-6 py-4 rounded-2xl font-bold"
        >
          Voltar ao Painel
        </Link>
      </div>
    </main>
  );
}