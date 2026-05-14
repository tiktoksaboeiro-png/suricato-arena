const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const dev = true;
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  let players = [];
  let tiktokConnection = null;

  const COLORS = {
    red: "#ff3b3b",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#a855f7",
  };

  function updateEvolution(player) {
    if (player.xp >= 1000) {
      player.level = 5;
      player.rarity = "legendary";
      player.aura = "gold";
      player.size = 150;
    } else if (player.xp >= 600) {
      player.level = 4;
      player.rarity = "epic";
      player.aura = "purple";
      player.size = 130;
    } else if (player.xp >= 300) {
      player.level = 3;
      player.rarity = "rare";
      player.aura = "blue";
      player.size = 115;
    } else if (player.xp >= 100) {
      player.level = 2;
      player.rarity = "uncommon";
      player.aura = "green";
      player.size = 100;
    } else {
      player.level = 1;
      player.rarity = "basic";
      player.aura = "white";
      player.size = 85;
    }
  }

  function createBot(name) {
    const bot = {
      name,
      points: Math.floor(Math.random() * 300),
      xp: Math.floor(Math.random() * 600),
      hp: 100,
      level: 1,
      rarity: "basic",
      aura: "white",
      size: 85,
      avatar: "",
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
      powers: ["attack"],
    };

    updateEvolution(bot);
    return bot;
  }

  players.push(createBot("BotFire"));
  players.push(createBot("BotShadow"));
  players.push(createBot("BotIce"));
  players.push(createBot("BotDragon"));

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

  function respawnOrRemove(player) {
    if (player.isBot) {
      player.hp = 100;
      player.energy = 100;
      player.x = Math.random() * 70 + 15;
      player.y = Math.random() * 25 + 45;
      player.moveAngle = Math.random() * Math.PI * 2;
    } else {
      players = players.filter((p) => p.name !== player.name);
    }
  }

  function applyGiftToArena({ user, gift, avatar }) {
    if (!gift) return;

    let player = players.find((p) => p.name === user);

    if (!player) {
      player = {
        name: user,
        points: 0,
        xp: 0,
        hp: 100,
        level: 1,
        rarity: "basic",
        aura: "white",
        size: 85,
        avatar: avatar || "",
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
        powers: [],
      };

      players.push(player);
    }

    player.lastGift = gift.name;
    player.action = gift.action;
    player.visual = gift.visual;
    player.color = COLORS[gift.visual] || player.color;

    player.points += gift.power || 0;
    player.xp += gift.xp || 0;

    if (!player.powers.includes(gift.action)) {
      player.powers.push(gift.action);
    }

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
      player.hp = Math.min(115, player.hp + 40);
    }

    updateEvolution(player);

    io.emit("arenaMessage", {
      text: `🎁 ${user} enviou ${gift.name}!`,
    });

    if (gift.action === "attack" || gift.action === "ultimate") {
      const target = getNearestEnemy(player);

      if (target) {
        const damage =
          gift.action === "ultimate"
            ? (gift.power || 10) * 3
            : gift.power || 10;

        target.hp -= damage;

        io.emit("arenaMessage", {
          text: `⚔️ ${player.name} atacou ${target.name} com ${gift.name}!`,
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

          respawnOrRemove(target);
        }
      }
    }

    players.sort((a, b) => b.points - a.points);
    io.emit("playersUpdate", players);
  }

  io.on("connection", (socket) => {
    console.log("Cliente conectado");
    socket.emit("playersUpdate", players);

    socket.on("testConfiguredGift", (data) => {
      applyGiftToArena({
        user: data.user || "João",
        gift: data.gift,
        avatar: data.avatar || "",
      });
    });

    socket.on("connectTikTok", async (data) => {
      const username = data.username;

      if (!username) {
        socket.emit("tiktokStatus", {
          message: "Digite um usuário válido.",
        });
        return;
      }

      socket.emit("tiktokStatus", {
        message: `Conectando na live de @${username}...`,
      });

      try {
        if (tiktokConnection) {
          try {
            await tiktokConnection.disconnect();
          } catch {}
        }

        tiktokConnection = new WebcastPushConnection(username);

        await tiktokConnection.connect();

        socket.emit("tiktokStatus", {
          message: `✅ Conectado na live de @${username}`,
        });

        tiktokConnection.on("gift", (giftData) => {
          const viewerName =
            giftData.nickname || giftData.uniqueId || "Viewer";

          const giftName =
            giftData.giftName || String(giftData.giftId) || "Presente";

          const avatar =
            giftData.profilePictureUrl ||
            giftData.userDetails?.profilePictureUrls?.[0] ||
            "";

          console.log("Presente recebido:", viewerName, giftName);

          applyGiftToArena({
            user: viewerName,
            avatar,
            gift: {
              name: giftName,
              action: "attack",
              power: 10,
              xp: 10,
              hp: 0,
              energy: 0,
              visual: "red",
            },
          });
        });

        tiktokConnection.on("chat", (chatData) => {
          console.log(`${chatData.nickname}: ${chatData.comment}`);
        });

        tiktokConnection.on("disconnected", () => {
          socket.emit("tiktokStatus", {
            message: "Live desconectada.",
          });
        });
      } catch (error) {
        console.log("Erro TikTok:", error);

        socket.emit("tiktokStatus", {
          message:
            "❌ Não foi possível conectar. Verifique se a live está ativa.",
        });
      }
    });
  });

  setInterval(() => {
    players.forEach((player) => {
      player.hp -= 0.01;
      player.energy -= 0.02;

      if (player.hp <= 0) {
        respawnOrRemove(player);
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

      const canAttack = player.powers.includes("attack");
      const canUltimate = player.powers.includes("ultimate");

      const attackChance = canUltimate ? 0.12 : canAttack ? 0.07 : 0.03;

      player.attacking = Math.random() < attackChance;

      if (player.attacking) {
        const damage = canUltimate ? 28 : canAttack ? 12 : 5;

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

          respawnOrRemove(target);
        }
      }

      if (player.powers.includes("heal") && Math.random() < 0.03) {
        player.hp = Math.min(100, player.hp + 2);
      }

      if (player.powers.includes("shield")) {
        player.hp = Math.min(115, player.hp);
      }

      updateEvolution(player);
    });

    players.sort((a, b) => b.points - a.points);
    io.emit("playersUpdate", players);
  }, 80);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});