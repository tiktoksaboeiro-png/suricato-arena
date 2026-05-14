const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let tiktokLive = null;
let testInterval = null;

const players = {};

function randomPosition() {
  return {
    x: Math.floor(Math.random() * 75) + 10,
    y: Math.floor(Math.random() * 55) + 25,
  };
}

function getLevel(points) {
  return Math.floor(points / 1000) + 1;
}

function addPlayer(user, photo) {
  if (!players[user]) {
    const pos = randomPosition();

    players[user] = {
      id: user,
      name: user,
      points: 0,
      level: 1,
      hp: 100,
      maxHp: 100,
      photo: photo || "/default-avatar.png",
      avatar: photo || "/default-avatar.png",
      x: pos.x,
      y: pos.y,
      alive: true,
    };
  }
}

function sendArenaUpdate() {
  io.emit("arena:update", {
    players: Object.values(players),
  });
}

function chooseTarget(attackerId) {
  const alivePlayers = Object.values(players).filter(
    (p) => p.id !== attackerId && p.alive !== false
  );

  if (alivePlayers.length === 0) return null;

  return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
}

function attackPlayer(attackerId, damage, visual = "blue") {
  addPlayer(attackerId);

  const attacker = players[attackerId];

  attacker.points += damage;
  attacker.level = getLevel(attacker.points);

  const target = chooseTarget(attackerId);

  if (!target) {
    sendArenaUpdate();
    return;
  }

  const hpDamage = Math.max(5, Math.floor(damage / 15));
  target.hp = Math.max(0, target.hp - hpDamage);

  if (target.hp <= 0) {
    target.alive = false;

    io.emit("battle:playerDown", {
      targetId: target.id,
      targetName: target.name,
      attackerId: attacker.id,
      attackerName: attacker.name,
    });

    setTimeout(() => {
      target.hp = target.maxHp;
      target.alive = true;

      const pos = randomPosition();
      target.x = pos.x;
      target.y = pos.y;

      sendArenaUpdate();
    }, 3000);
  }

  const move = randomPosition();
  attacker.x = move.x;
  attacker.y = move.y;

  io.emit("battle:pvpAttack", {
    attackerId: attacker.id,
    attackerName: attacker.name,
    targetId: target.id,
    targetName: target.name,
    damage: hpDamage,
    rawPower: damage,
    visual,
    fromX: attacker.x,
    fromY: attacker.y,
    toX: target.x,
    toY: target.y,
  });

  sendArenaUpdate();
}

app.post("/connect", async (req, res) => {
  try {
    const username = req.body.username;

    if (!username) {
      return res.status(400).json({
        error: "Username obrigatório",
      });
    }

    if (tiktokLive) {
      try {
        tiktokLive.disconnect();
      } catch {}
    }

    tiktokLive = new WebcastPushConnection(username);

    await tiktokLive.connect();

    console.log("TikTok conectado:", username);

    tiktokLive.on("like", (data) => {
      const user = data.uniqueId;
      const damage = data.likeCount || 1;

      addPlayer(user, data.profilePictureUrl);
      attackPlayer(user, damage, "cyan");
    });

    tiktokLive.on("gift", (data) => {
      const user = data.uniqueId;
      const damage = (data.diamondCount || 1) * 20;

      addPlayer(user, data.profilePictureUrl);
      attackPlayer(user, damage, "gold");
    });

    return res.json({
      success: true,
      username,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: "Erro ao conectar",
    });
  }
});

app.post("/test/start", (req, res) => {
  if (testInterval) {
    clearInterval(testInterval);
  }

  const bots = [
    "ShadowHunter",
    "MegaLion",
    "DarkSniper",
    "TikWarrior",
    "ArenaKing",
    "LuvaBoss",
    "GalaxyBoy",
    "SniperX",
  ];

  bots.forEach((bot) => addPlayer(bot));

  testInterval = setInterval(() => {
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const damage = Math.floor(Math.random() * 450) + 80;

    const visuals = ["cyan", "gold", "purple", "green", "red"];
    const visual = visuals[Math.floor(Math.random() * visuals.length)];

    attackPlayer(bot, damage, visual);

    console.log(`${bot} atacou causando ${damage}`);
  }, 900);

  sendArenaUpdate();

  return res.json({
    success: true,
    message: "Modo teste PvP iniciado",
  });
});

app.post("/test/stop", (req, res) => {
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }

  return res.json({
    success: true,
    message: "Modo teste parado",
  });
});

app.post("/test/reset", (req, res) => {
  Object.keys(players).forEach((key) => delete players[key]);

  sendArenaUpdate();

  return res.json({
    success: true,
    message: "Arena resetada",
  });
});

io.on("connection", () => {
  console.log("Overlay conectado");
  sendArenaUpdate();
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});