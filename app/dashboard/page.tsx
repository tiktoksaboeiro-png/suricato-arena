"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const logged = localStorage.getItem("suricato_logged");

    if (!logged) {
      router.push("/login");
      return;
    }

    setEmail(localStorage.getItem("suricato_email") || "Usuário");
  }, [router]);

  function logout() {
    localStorage.removeItem("suricato_logged");
    localStorage.removeItem("suricato_email");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black">SURICATO ARENA</h1>
          <p className="text-zinc-400 mt-2">
            Painel principal do jogo da live
          </p>
          <p className="text-zinc-500 text-sm mt-1">
            Logado como: {email}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-400 px-5 py-3 rounded-xl font-bold"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/gifts"
          className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-green-400 transition shadow-xl"
        >
          <div className="text-6xl mb-5">🎁</div>
          <h2 className="text-3xl font-black mb-3">
            Configurar Presentes
          </h2>
          <p className="text-zinc-400">
            Escolha qualquer presente da live e defina o que ele faz no monstro.
          </p>
        </Link>

        <Link
          href="/start"
          className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-yellow-400 transition shadow-xl"
        >
          <div className="text-6xl mb-5">⚔️</div>
          <h2 className="text-3xl font-black mb-3">Arena</h2>
          <p className="text-zinc-400">
            Inicie ou pare a arena, abra o overlay e copie o link da live.
          </p>
        </Link>

        <Link
          href="/overlay"
          target="_blank"
          className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-400 transition shadow-xl"
        >
          <div className="text-6xl mb-5">📺</div>
          <h2 className="text-3xl font-black mb-3">Overlay</h2>
          <p className="text-zinc-400">
            Tela transparente que será colocada no TikTok Live Studio.
          </p>
        </Link>
      </div>
    </main>
  );
}