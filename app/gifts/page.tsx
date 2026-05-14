"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

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
  const [testUser, setTestUser] = useState("João");
  const [gifts, setGifts] = useState<GiftConfig[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("suricato_gifts");
    if (saved) setGifts(JSON.parse(saved));
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
    saveAll(gifts.filter((_, i) => i !== index));
  }

  function testGift(gift: GiftConfig) {
    socket.emit("testConfiguredGift", {
      user: testUser || "João",
      gift,
    });
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black">Configurar Presentes</h1>
          <p className="text-zinc-400 mt-2">
            Configure qualquer presente da live e escolha o poder que ele dará ao jogador.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-bold"
        >
          Voltar
        </Link>
      </div>

      <div className="mb-8 bg-zinc-900 border border-zinc-700 rounded-3xl p-6">
        <h2 className="text-2xl font-black mb-4">Teste da Arena</h2>

        <label className="font-bold">Nome do jogador de teste</label>
        <input
          className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full max-w-md"
          placeholder="Ex: João"
          value={testUser}
          onChange={(e) => setTestUser(e.target.value)}
        />

        <p className="text-zinc-500 mt-2">
          Esse nome será usado quando você clicar em TESTAR NA ARENA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <h2 className="text-3xl font-black mb-6">Novo Presente</h2>

          <div className="grid gap-5">
            <div>
              <label className="font-bold">Nome do presente</label>
              <input
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                placeholder="Ex: Rosa, Galaxy, Coração, Perfume"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
              />
              <p className="text-sm text-zinc-500 mt-1">
                Digite exatamente o nome do presente que aparece na live.
              </p>
            </div>

            <div>
              <label className="font-bold">Ação do presente</label>
              <select
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
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
              <p className="text-sm text-zinc-500 mt-1">
                Define o tipo de poder que o jogador ganha ao enviar esse presente.
              </p>
            </div>

            <div>
              <label className="font-bold">Dano / Força do poder</label>
              <input
                type="number"
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
              />
              <p className="text-sm text-zinc-500 mt-1">
                Quanto maior, mais forte será o ataque ou ultimate.
              </p>
            </div>

            <div>
              <label className="font-bold">XP que o monstro ganha</label>
              <input
                type="number"
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
              />
              <p className="text-sm text-zinc-500 mt-1">
                XP ajuda o monstro a subir de nível.
              </p>
            </div>

            <div>
              <label className="font-bold">HP que recupera</label>
              <input
                type="number"
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
              />
              <p className="text-sm text-zinc-500 mt-1">
                Use para presentes de cura ou escudo. Ex: 20, 50, 100.
              </p>
            </div>

            <div>
              <label className="font-bold">Energia que recupera</label>
              <input
                type="number"
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />
              <p className="text-sm text-zinc-500 mt-1">
                Energia será usada para skills especiais e ultimate.
              </p>
            </div>

            <div>
              <label className="font-bold">Cor do poder visual</label>
              <select
                className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none w-full"
                value={visual}
                onChange={(e) => setVisual(e.target.value)}
              >
                <option value="red">Raio vermelho</option>
                <option value="blue">Raio azul</option>
                <option value="green">Raio verde</option>
                <option value="yellow">Raio amarelo</option>
                <option value="purple">Raio roxo</option>
              </select>
              <p className="text-sm text-zinc-500 mt-1">
                Define a cor do raio/efeito que aparece na arena.
              </p>
            </div>

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
                    <p className="text-zinc-300">Dano/Força: {gift.power}</p>
                    <p className="text-zinc-300">XP: {gift.xp}</p>
                    <p className="text-zinc-300">HP: {gift.hp}</p>
                    <p className="text-zinc-300">Energia: {gift.energy}</p>
                    <p className="text-zinc-300">Visual: {gift.visual}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => testGift(gift)}
                      className="bg-blue-500 hover:bg-blue-400 px-4 py-3 rounded-xl font-black"
                    >
                      TESTAR NA ARENA
                    </button>

                    <button
                      onClick={() => removeGift(index)}
                      className="bg-red-500 hover:bg-red-400 px-4 py-3 rounded-xl font-bold"
                    >
                      Remover
                    </button>
                  </div>
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