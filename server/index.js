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

const players = {};

let monster = {
  name: "BOSS SURICATO",
  hp: 10000,
  maxHp: 10000,
};

function sendArenaUpdate() {
  io.emit("arena:update", {
    players: Object.values(players),
    monster,
  });
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

      if (!players[user]) {
        players[user] = {
          id: user,
          name: user,
          points: 0,
          level: 1,
          hp: 100,
          photo:
            data.profilePictureUrl ||
            "/default-avatar.png",
        };
      }

      const damage = data.likeCount || 1;

      players[user].points += damage;

      monster.hp -= damage;

      if (monster.hp <= 0) {
        monster.hp = monster.maxHp;
      }

      io.emit("battle:damage", {
        user,
        damage,
      });

      sendArenaUpdate();

      console.log(user, "causou", damage);
    });

    tiktokLive.on("gift", (data) => {
      const user = data.uniqueId;

      if (!players[user]) {
        players[user] = {
          id: user,
          name: user,
          points: 0,
          level: 1,
          hp: 100,
          photo:
            data.profilePictureUrl ||
            "/default-avatar.png",
        };
      }

      const damage = (data.diamondCount || 1) * 20;

      players[user].points += damage;

      monster.hp -= damage;

      io.emit("battle:damage", {
        user,
        damage,
      });

      sendArenaUpdate();

      console.log(user, "mandou gift");
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

io.on("connection", () => {
  console.log("Overlay conectado");

  sendArenaUpdate();
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});