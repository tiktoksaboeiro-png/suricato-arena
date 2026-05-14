const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = true;
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  let players = [];

  const COLORS = {
    red: "#ff3b3b",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#a855f7",
  };

  function createBot(name) {
    return {
      name,
      points: Math.floor(Math.random() * 300),
      xp: Math.floor(Math.random() * 600),
      hp: 100,
      level: Math.floor(Math.random() * 5) + 1,
      action: "attack",
      lastGift: "BOT",
      visual: "red",
      color: "#ff3b3b",
      x: Math.random() * 70 + 15,
      y: Math.random() * 25 + 45,
      target: null,
      attacking: false,
      isBot: true,
      energy: 100,
      moveAngle: Math.random() * Math.PI * 2,
      moveTimer: 0,
    };
  }

  players.push(createBot("BotFire"));
  players.push(createBot("BotShadow"));
  players.push(createBot("BotIce"));
  players.push(createBot("BotDragon"));

  io.on("connection", (socket) => {
    console.log("Cliente conectado");
    socket.emit("playersUpdate", players);

    socket.on("testConfiguredGift", (data) => {
      const gift = data.gift;
      const user = data.user || "João";

      if (!gift) return;

      let player = players.find((p) => p.name === user);

      if (!player) {
        player = {
          name: user,
          points: 0,
          xp: 0,
          hp: 100,
          level: 1,
          action: gift.action,
          lastGift: gift.name,
          visual: gift.visual,
          color: COLORS[gift.visual] || "#ff3b3b",
          x: Math.random() * 70 + 15,
          y: Math.random() * 25 + 45,
          target: null,
          attacking: false,
          isBot: false,
          energy: 100,
          moveAngle: Math.random() * Math.PI * 2,
          moveTimer: 0,
        };

        players.push(player);
      }

      player.lastGift = gift.name;
      player.action = gift.action;
      player.visual = gift.visual;
      player.color = COLORS[gift.visual] || player.color;

      player.points += gift.power || 0;
      player.xp += gift.xp || 0;

      if (gift.action === "heal") {
        player.hp = Math.min(100, player.hp + (gift.hp || 20));
      }

      if (gift.action === "energy") {
        player.energy = Math.min(100, player.energy + (gift.energy || 25));
      }

      if (gift.action === "evolution") {
        player.xp += 150;
      }

      if (gift.action === "ultimate") {
        player.xp += 250;
        player.points += 200;
      }

      if (gift.action === "shield") {
        player.hp = Math.min(100, player.hp + 40);
      }

      if (player.xp >= 1000) player.level = 5;
      else if (player.xp >= 600) player.level = 4;
      else if (player.xp >= 300) player.level = 3;
      else if (player.xp >= 100) player.level = 2;
      else player.level = 1;

      io.emit("arenaMessage", {
        text: `🎁 ${user} usou ${gift.name}: ${gift.action}!`,
      });

      if (gift.action === "attack" || gift.action === "ultimate") {
        const target = getNearestEnemy(player);

        if (target) {
          const damage = gift.action === "ultimate" ? gift.power * 3 : gift.power;

          target.hp -= damage;

          io.emit("arenaMessage", {
            text: `⚔️ ${player.name} lançou ${gift.name} em ${target.name}!`,
            attacker: player.name,
            target: target.name,
          });

          if (target.hp <= 0) {
            player.points += 100;

            io.emit("arenaMessage", {
              text: `👑 ${player.name} derrotou ${target.name}!`,
              attacker: player.name,
              target: target.name,
            });

            if (target.isBot) {
              target.hp = 100;
              target.energy = 100;
              target.x = Math.random() * 70 + 15;
              target.y = Math.random() * 25 + 45;
              target.moveAngle = Math.random() * Math.PI * 2;
            } else {
              players = players.filter((p) => p.name !== target.name);
            }
          }
        }
      }

      players.sort((a, b) => b.points - a.points);
      io.emit("playersUpdate", players);
    });

    socket.on("testGift", (giftData) => {
      socket.emit("testConfiguredGift", {
        user: giftData.user || "João",
        gift: {
          name: giftData.gift || "Teste",
          action: giftData.action || "attack",
          power: giftData.power || 10,
          xp: giftData.power || 10,
          hp: 10,
          energy: 10,
          visual: "red",
        },
      });
    });
  });

  function getNearestEnemy(player) {
    const enemies = players.filter((p) => p.name !== player.name);
    if (enemies.length === 0) return null;

    let target = enemies[0];
    let shortestDistance = Infinity;

    enemies.forEach((enemy) => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        target = enemy;
      }
    });

    return target;
  }

  setInterval(() => {
    players.forEach((player) => {
      player.hp -= 0.015;
      player.energy -= 0.03;

      if (player.hp <= 0) {
        if (player.isBot) {
          player.hp = 100;
          player.energy = 100;
          player.x = Math.random() * 70 + 15;
          player.y = Math.random() * 25 + 45;
          player.moveAngle = Math.random() * Math.PI * 2;
        } else {
          players = players.filter((p) => p.name !== player.name);
        }

        return;
      }

      player.moveTimer--;

      if (player.moveTimer <= 0) {
        player.moveAngle += (Math.random() - 0.5) * 2;
        player.moveTimer = 40 + Math.random() * 60;
      }

      const speed =
        player.level >= 5
          ? 0.9
          : player.level === 4
          ? 0.8
          : player.level === 3
          ? 0.7
          : player.level === 2
          ? 0.6
          : 0.5;

      player.x += Math.cos(player.moveAngle) * speed;
      player.y += Math.sin(player.moveAngle) * speed;

      if (player.x <= 10 || player.x >= 90) {
        player.moveAngle = Math.PI - player.moveAngle;
      }

      if (player.y <= 40 || player.y >= 82) {
        player.moveAngle = -player.moveAngle;
      }

      players.forEach((other) => {
        if (other.name === player.name) return;

        const dx = player.x - other.x;
        const dy = player.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const minDistance = 26;

        if (distance < minDistance && distance > 0) {
          const push = (minDistance - distance) * 0.12;

          player.x += (dx / distance) * push;
          player.y += (dy / distance) * push;
        }
      });

      player.x = Math.max(10, Math.min(90, player.x));
      player.y = Math.max(40, Math.min(82, player.y));

      const target = getNearestEnemy(player);

      if (!target) return;

      player.target = target.name;

      const attackChance =
        player.level >= 5
          ? 0.12
          : player.level === 4
          ? 0.1
          : player.level === 3
          ? 0.08
          : 0.06;

      player.attacking = Math.random() < attackChance;

      if (player.attacking) {
        const damage =
          player.level >= 5
            ? 30
            : player.level === 4
            ? 22
            : player.level === 3
            ? 15
            : player.level === 2
            ? 10
            : 5;

        target.hp -= damage;

        io.emit("arenaMessage", {
          text: `⚔️ ${player.name} atacou ${target.name}!`,
          attacker: player.name,
          target: target.name,
        });

        if (target.hp <= 0) {
          player.points += 100;

          io.emit("arenaMessage", {
            text: `👑 ${player.name} derrotou ${target.name}!`,
            attacker: player.name,
            target: target.name,
          });

          if (target.isBot) {
            target.hp = 100;
            target.energy = 100;
            target.x = Math.random() * 70 + 15;
            target.y = Math.random() * 25 + 45;
            target.moveAngle = Math.random() * Math.PI * 2;
          } else {
            players = players.filter((p) => p.name !== target.name);
          }
        }
      }
    });

    players.sort((a, b) => b.points - a.points);
    io.emit("playersUpdate", players);
  }, 80);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});