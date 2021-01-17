const Handler = require("../structs/Handler");
const s = JSON.stringify;

class Client {
  constructor(ws, id) {
    this.ws = ws;
    // 0 = awaiting, 1 = authenticated
    this.state = 0;
    this.user = id;
  }
}

let id = 1;
class Messenger extends Handler {
  constructor(server) {
    super("/messages", server);
    this.clients = new Map();
  }

  onConnect(ws) {
    const c = new Client(ws, id);
    this.clients.set(id--, c);
    ws.on("message", (msg) => this.onMessage(msg, c.user));
  }

  async onMessage(message, id) {
    try {
      const msg = JSON.parse(message);
      const client = this.clients.get(id);
      // When awaiting, expect {token: insert_token}.
      // error 0 = token good, 1 = no token and close, 2 = invalid token and close, 3 = no channel,
      // 4 = invalid channel, 5 = no text, 6 = text too long
      if (client.state === 0) {
        if (!msg.token) {
          client.ws.send(s({error: 1}));
          client.ws.close();
          this.clients.delete(id);
          return;
        }
        const ret = await this.server.db.query("SELECT id FROM credentials WHERE token = ?", [msg.token]);
        if (ret.res.length === 0) {
          client.ws.send(s({error: 2}));
          client.ws.close();
          this.clients.delete(id);
          return;
        }
        const old = client.user;
        client.user = ret.res[0].id;
        if (this.clients.has(client.user)) {
          this.clients.get(client.user).ws.send(s({close: true}));
          this.clients.get(client.user).ws.close();
        }
        client.ws.send(s({error: 0, id: client.user}));
        client.state = 1;
        const channels = await this.server.db.query("SELECT id FROM channels WHERE user = ?", [client.user]);
        client.channels = channels.res;
        this.clients.delete(old);
        this.clients.set(client.user, client);
        return;
      }
      // Assume state = 1
      if (!msg.channel) {
        client.ws.send(s({error: 3}));
        return;
      }
      const ch = client.channels.find((c) => c.id === msg.channel);
      if (!ch) {
        client.ws.send(s({error: 4}));
        return;
      }
      const text = msg.text;
      if (!text) {
        client.ws.send(s({error: 5}));
        return;
      }
      if (text.length > 1000) {
        client.ws.send(s({error: 6}));
        return;
      }

      const members = await this.server.db.query("SELECT user FROM channels WHERE id = ?", [ch.id]);
      const now = Date.now();
      for (const member of members.res) {
        if (this.clients.has(member.user)) {
          const recipient = this.clients.get(member.user);
          recipient.ws.send(s({msg: text, author: client.user, timestamp: now, channel: ch.id}));
        }
      }

      await this.server.db.query("INSERT INTO messages (channel, msg, author, timestamp) VALUES (?, ?, ?, ?)", [ch.id, text, client.user, now]);

    }
    catch(e) {
      // Probably invalid json?
    }
  }
}

module.exports = Messenger;