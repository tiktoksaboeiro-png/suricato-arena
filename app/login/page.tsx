"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }

    localStorage.setItem("suricato_logged", "true");
    localStorage.setItem("suricato_email", email);

    router.push("/dashboard");
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white flex items-center justify-center p-6"
      style={{
        backgroundImage: "url('/login-bg.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-md bg-black/65 border border-purple-500/60 rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.5)] backdrop-blur-md">
        <h1 className="text-4xl font-black text-center mb-2">
          SURICATO ARENA
        </h1>

        <p className="text-zinc-300 text-center mb-8">
          Entre para configurar sua arena
        </p>

        <div className="flex flex-col gap-4">
          <input
            className="p-4 rounded-xl bg-black/70 border border-purple-500/40 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="p-4 rounded-xl bg-black/70 border border-purple-500/40 outline-none"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="p-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-black text-xl"
          >
            ENTRAR
          </button>
        </div>
      </div>
    </main>
  );
}