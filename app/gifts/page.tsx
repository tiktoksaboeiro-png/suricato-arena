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

export default function GiftsPage() {
  const [giftName, setGiftName] = useState("");
  const [action, setAction] = useState("attack");
  const [power, setPower] = useState(10);
  const [xp, setXp] = useState(10);
  const [hp, setHp] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [visual, setVisual] = useState("red");
  const [gifts, setGifts] = useState<GiftConfig[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("suricato_gifts");

    if (saved) {
      setGifts(JSON.parse(saved));
    }
  }, []);

  function saveAll(newGifts: GiftConfig[]) {
    setGifts(newGifts);
    localStorage.setItem("suricato_gifts", JSON.stringify(newGifts));
  }

  function addGift() {
    if (!giftName) {
      alert("Digite o nome do presente.");
      return;
    }

    const newGift: GiftConfig = {
      name: giftName,
      action,
      power,
      xp,
      hp,
      energy,
      visual,
    };

    saveAll([...gifts, newGift]);

    setGiftName("");
    setPower(10);
    setXp(10);
    setHp(0);
    setEnergy(0);
  }

  function removeGift(index: number) {
    const updated = gifts.filter((_, i) => i !== index);
    saveAll(updated);
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black">Configurar Presentes</h1>
          <p className="text-zinc-400 mt-2">
            Escolha o que cada presente faz no monstro.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-bold"
        >
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <h2 className="text-3xl font-black mb-6">Novo Presente</h2>

          <div className="grid gap-4">
            <input
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              placeholder="Nome do presente. Ex: Rosa"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
            />

            <select
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="attack">Ataque</option>
              <option value="heal">Curar HP</option>
              <option value="energy">Dar energia</option>
              <option value="shield">Escudo</option>
              <option value="speed">Velocidade</option>
              <option value="evolution">Evoluir monstro</option>
              <option value="ultimate">Ultimate</option>
            </select>

            <input
              type="number"
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              placeholder="Poder / Dano"
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
            />

            <input
              type="number"
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              placeholder="XP"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
            />

            <input
              type="number"
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              placeholder="HP que recupera"
              value={hp}
              onChange={(e) => setHp(Number(e.target.value))}
            />

            <input
              type="number"
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              placeholder="Energia que recupera"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />

            <select
              className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none"
              value={visual}
              onChange={(e) => setVisual(e.target.value)}
            >
              <option value="red">Raio vermelho</option>
              <option value="blue">Raio azul</option>
              <option value="green">Raio verde</option>
              <option value="yellow">Raio amarelo</option>
              <option value="purple">Raio roxo</option>
            </select>

            <button
              onClick={addGift}
              className="bg-green-500 hover:bg-green-400 text-black p-4 rounded-xl font-black text-xl"
            >
              SALVAR PRESENTE
            </button>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <h2 className="text-3xl font-black mb-6">
            Presentes Configurados
          </h2>

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

                  <button
                    onClick={() => removeGift(index)}
                    className="bg-red-500 hover:bg-red-400 h-fit px-4 py-2 rounded-xl font-bold"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}

            {gifts.length === 0 && (
              <p className="text-zinc-500">
                Nenhum presente configurado ainda.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}