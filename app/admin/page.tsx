"use client";

import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function AdminPage() {
  const [giftName, setGiftName] = useState("");
  const [giftAction, setGiftAction] = useState("attack");
  const [giftPower, setGiftPower] = useState(10);

  const [gifts, setGifts] = useState<any[]>([]);

  function addGift() {
    if (!giftName) return;

    const newGift = {
      name: giftName,
      action: giftAction,
      power: giftPower,
    };

    setGifts([...gifts, newGift]);

    setGiftName("");
    setGiftPower(10);
  }

  function testGift(gift: any) {
    socket.emit("testGift", {
      user: "João",
      power: gift.power,
      action: gift.action,
      gift: gift.name,
    });
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        SURICATO ARENA - PAINEL
      </h1>

      <div className="bg-zinc-900 p-6 rounded-2xl max-w-xl">
        <h2 className="text-2xl font-bold mb-5">
          Configurar Presente
        </h2>

        <div className="flex flex-col gap-4">
          <input
            className="p-4 rounded-xl bg-zinc-800"
            placeholder="Nome do presente"
            value={giftName}
            onChange={(e) => setGiftName(e.target.value)}
          />

          <select
            className="p-4 rounded-xl bg-zinc-800"
            value={giftAction}
            onChange={(e) => setGiftAction(e.target.value)}
          >
            <option value="attack">Ataque</option>
            <option value="shield">Escudo</option>
            <option value="speed">Velocidade</option>
            <option value="ultimate">Ultimate</option>
            <option value="evolution">Evolução</option>
          </select>

          <input
            type="number"
            className="p-4 rounded-xl bg-zinc-800"
            value={giftPower}
            onChange={(e) => setGiftPower(Number(e.target.value))}
          />

          <button
            onClick={addGift}
            className="bg-green-500 hover:bg-green-400 p-4 rounded-xl font-bold text-xl"
          >
            SALVAR PRESENTE
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-5">
          Presentes Configurados
        </h2>

        <div className="grid gap-4">
          {gifts.map((gift, index) => (
            <div
              key={index}
              className="bg-zinc-900 p-5 rounded-2xl border border-zinc-700"
            >
              <h3 className="text-2xl font-bold">
                {gift.name}
              </h3>

              <p className="text-zinc-300">
                Ação: {gift.action}
              </p>

              <p className="text-zinc-300">
                Poder: {gift.power}
              </p>

              <button
                onClick={() => testGift(gift)}
                className="mt-4 bg-blue-500 hover:bg-blue-400 px-5 py-3 rounded-xl font-bold"
              >
                TESTAR GIFT
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}