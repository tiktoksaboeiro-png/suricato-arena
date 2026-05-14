"use client";

import Link from "next/link";
import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function TikTokPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("Desconectado");

  function connectTikTok() {
    if (!username) {
      alert("Digite o @ da live.");
      return;
    }

    const cleanUser = username.replace("@", "").trim();

    socket.emit("connectTikTok", {
      username: cleanUser,
    });

    setStatus(`Tentando conectar em @${cleanUser}...`);
  }

  socket.on("tiktokStatus", (data) => {
    setStatus(data.message);
  });

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black">Conectar TikTok</h1>
          <p className="text-zinc-400 mt-2">
            Conecte sua live para receber presentes reais na arena.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-bold"
        >
          Voltar
        </Link>
      </div>

      <section className="max-w-2xl bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <label className="font-bold text-xl">Usuário da live TikTok</label>

        <input
          className="mt-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
          placeholder="Ex: @seuusuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <p className="text-zinc-500 mt-2">
          Digite o usuário que está ao vivo no TikTok.
        </p>

        <button
          onClick={connectTikTok}
          className="mt-6 bg-pink-600 hover:bg-pink-500 p-4 rounded-xl font-black text-xl w-full"
        >
          CONECTAR NA LIVE
        </button>

        <div className="mt-6 bg-black/60 border border-zinc-700 rounded-2xl p-5">
          <h2 className="font-black text-2xl mb-2">Status</h2>
          <p className="text-zinc-300">{status}</p>
        </div>
      </section>
    </main>
  );
}