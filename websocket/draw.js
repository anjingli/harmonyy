/*
const Handler = require("../structs/Handler");
const s = JSON.stringify;

class Draw extends Handler {
  constructor(server) {
    super("/draw", server);
    this.users = new Map();
    this.userList = [];
    this.unconfirmed = [];
    this.drawer = 0;
    this.word = "";
    this.scoreboard = new Map();
    this.timeLeft = 0;

    setInterval(() => {
      if (this.timeLeft === 0) {
        if (this.userList.length < 2) return;
        this.timeLeft = 60;
        this.word = "Gillian";
        this.drawer++;
        if (this.drawer === this.userList.length) this.drawer = 0;
        this.userList[this.drawer].ws.send(s({word: this.word}));
        for (const u of this.userList) u.ws.send(s(Array.from(this.scoreboard)));
        return;
      }
      this.timeLeft--;
      for (const u of this.userList) u.ws.send(s({time: this.timeLeft}));
    }, 1000);
  }

  onConnect(ws) {

    this.unconfirmed.push(ws);
    ws.on("message", (msg) => this.onMessage(msg, ws));

  }

  // Giving up on error handling.
  async onMessage(message, id) {

    const ws = id;
    const msg = JSON.parse(message);
    if (this.unconfirmed.find((w) => w === ws)) {
      if (!msg.token) return;
      const token = await this.server.db.query("SELECT * FROM credentials WHERE token = ?", [msg.token]);
      if (!token.res.length) return;
      const u = {user: token.res[0], ws};
      this.users.set(token.res[0].token, u);
      this.userList.push(u);
      this.scoreboard.set(msg.token, 0);
      this.unconfirmed.splice(this.unconfirmed.indexOf(ws), 1);
      ws.send({confirmed: true});
      return;
    }
    if (this.userList[this.drawer].ws === ws && msg.action) {
      for (const u of this.userList) {
        u.ws.send(s(msg));
      }
      return;
    }
    if (this.userList[this.drawer].ws !== ws && msg.guess) {
      if (this.word === msg.guessText) {
        const score = 1000 - (500 / 60) * (60 - this.time);
        const cur = this.scoreboard.get(msg.token);
        this.scoreboard.set(msg.token, score + cur);
      }
      else {
        ws.send({incorrect: true});
      }
    }

  }
}

module.exports = Draw;
*/