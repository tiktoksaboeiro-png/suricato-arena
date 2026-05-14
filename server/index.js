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

let monster = {
  name: "BOSS SURICATO",
  hp: 10000,
  maxHp: 10000,
  image: "/monsters/default.png",
};

function sendArenaUpdate() {
  io.emit("arena:update", {
    players: Object.values(players),
    monster,
  });
}

function addPlayer(user, photo) {
  if (!players[user]) {
    players[user] = {
      id: user,
      name: user,
      points: 0,
      level: 1,
      hp: 100,
      maxHp: 100,
      photo: photo || "/default-avatar.png",
      x: 20 + Math.random() * 60,
      y: 10,
    };
  }
}

function attack(user, damage) {
  addPlayer(user);

  players[user].points += damage;
  players[user].level = Math.floor(players[user].points / 1000) + 1;

  monster.hp -= damage;

  if (monster.hp <= 0) {
    monster.hp = monster.maxHp;
    io.emit("battle:bossDefeated", {
      winner: user,
    });
  }

  io.emit("battle:damage", {
    user,
    damage,
  });

  sendArenaUpdate();
}

app.post("/connect", async (req, res) => {
  try {
    const username = req.body.username;

    if (!username) {
      return res.status(400).json({ error: "Username obrigatório" });
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
      attack(user, damage);
    });

    tiktokLive.on("gift", (data) => {
      const user = data.uniqueId;
      const damage = (data.diamondCount || 1) * 20;

      addPlayer(user, data.profilePictureUrl);
      attack(user, damage);
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
  ];

  testInterval = setInterval(() => {
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const damage = Math.floor(Math.random() * 350) + 50;

    attack(bot, damage);

    console.log(`${bot} causou ${damage} de dano`);
  }, 1200);

  return res.json({
    success: true,
    message: "Modo teste iniciado",
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

  monster = {
    name: "BOSS SURICATO",
    hp: 10000,
    maxHp: 10000,
    image: "/monsters/default.png",
  };

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