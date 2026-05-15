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
  cors: { origin: "*" },
});

let tiktokLive = null;
let testInterval = null;

const players = {};

let arena = {
  started: true,
  champion: null,
};

function randomPosition() {
  return {
    x: Math.floor(Math.random() * 82) + 8,
    y: Math.floor(Math.random() * 68) + 12,
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
      eliminated: false,
    };
  }
}

function revivePlayer(user, type) {
  const player = players[user];
  if (!player) return;

  if (player.eliminated || player.alive === false) {
    player.alive = true;
    player.eliminated = false;

    player.hp = type === "gift" ? 100 : 35;

    const pos = randomPosition();
    player.x = pos.x;
    player.y = pos.y;

    io.emit("battle:revive", {
      playerId: player.id,
      playerName: player.name,
      type,
      hp: player.hp,
    });
  }
}

function getAlivePlayers() {
  return Object.values(players).filter((p) => p.alive !== false && !p.eliminated);
}

function sendArenaUpdate() {
  io.emit("arena:update", {
    players: Object.values(players),
    alivePlayers: getAlivePlayers(),
    champion: arena.champion,
  });
}

function chooseTarget(attackerId) {
  const alivePlayers = getAlivePlayers().filter((p) => p.id !== attackerId);

  if (alivePlayers.length === 0) return null;

  return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
}

function checkChampion() {
  const alive = getAlivePlayers();

  if (alive.length === 1) {
    arena.champion = alive[0];

    io.emit("battle:champion", {
      champion: arena.champion,
    });
  }
}

function getAttackVisual(type, points) {
  if (type === "gift") {
    if (points >= 15000) {
      return {
        color: "#ffd700",
        aura: "legendary",
        size: 54,
        label: "ULTIMATE GIFT",
      };
    }

    return {
      color: "#b26cff",
      aura: "gift",
      size: 42,
      label: "GIFT POWER",
    };
  }

  return {
    color: "#00eaff",
    aura: "like",
    size: 24,
    label: "LIKE HIT",
  };
}

function attackPlayer(attackerId, rawPower, type = "like", visualColor = null) {
  addPlayer(attackerId);

  const attacker = players[attackerId];

  revivePlayer(attackerId, type);

  attacker.points += rawPower;
  attacker.level = getLevel(attacker.points);

  const target = chooseTarget(attackerId);

  if (!target) {
    sendArenaUpdate();
    return;
  }

  const hpDamage =
    type === "gift"
      ? Math.max(12, Math.floor(rawPower / 10))
      : Math.max(3, Math.floor(rawPower / 20));

  const oldX = attacker.x;
  const oldY = attacker.y;

  target.hp = Math.max(0, target.hp - hpDamage);

  if (target.hp <= 0) {
    target.alive = false;
    target.eliminated = true;
    target.hp = 0;

    io.emit("battle:playerEliminated", {
      targetId: target.id,
      targetName: target.name,
      attackerId: attacker.id,
      attackerName: attacker.name,
    });
  }

  const move = randomPosition();
  attacker.x = move.x;
  attacker.y = move.y;

  const attackVisual = getAttackVisual(type, attacker.points);

  io.emit("battle:pvpAttack", {
    attackerId: attacker.id,
    attackerName: attacker.name,
    targetId: target.id,
    targetName: target.name,

    type,
    label: attackVisual.label,

    damage: hpDamage,
    rawPower,

    color: visualColor || attackVisual.color,
    size: attackVisual.size,
    aura: attackVisual.aura,

    fromX: oldX,
    fromY: oldY,
    toX: target.x,
    toY: target.y,
  });

  checkChampion();
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
      attackPlayer(user, damage, "like", "#00eaff");
    });

    tiktokLive.on("gift", (data) => {
      const user = data.uniqueId;

      const diamonds = data.diamondCount || 1;
      const repeat = data.repeatCount || 1;
      const damage = diamonds * repeat * 30;

      addPlayer(user, data.profilePictureUrl);
      attackPlayer(user, damage, "gift", "#ffd700");
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

  arena.champion = null;

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

  bots.forEach((bot) => {
    addPlayer(bot);
    players[bot].alive = true;
    players[bot].eliminated = false;
    players[bot].hp = 100;
  });

  testInterval = setInterval(() => {
    const alive = getAlivePlayers();

    if (alive.length <= 1) {
      checkChampion();
      clearInterval(testInterval);
      testInterval = null;
      sendArenaUpdate();
      return;
    }

    const bot = alive[Math.floor(Math.random() * alive.length)].id;

    const isGift = Math.random() > 0.65;

    const power = isGift
      ? Math.floor(Math.random() * 900) + 400
      : Math.floor(Math.random() * 120) + 20;

    const colors = isGift
      ? ["#ffd700", "#b26cff", "#ff2bd6", "#ff7a00"]
      : ["#00eaff", "#00ff88", "#0099ff"];

    const color = colors[Math.floor(Math.random() * colors.length)];

    attackPlayer(bot, power, isGift ? "gift" : "like", color);

    console.log(`${bot} usou ${isGift ? "GIFT" : "LIKE"} causando ${power}`);
  }, 850);

  sendArenaUpdate();

  return res.json({
    success: true,
    message: "Modo teste Battle Royale iniciado",
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

  arena.champion = null;

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