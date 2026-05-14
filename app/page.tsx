"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem("suricato_logged");

    if (logged === "true") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-5xl font-black mb-4">
          SURICATO ARENA
        </h1>

        <p className="text-zinc-400 text-xl">
          Carregando plataforma...
        </p>
      </div>
    </main>
  );
}