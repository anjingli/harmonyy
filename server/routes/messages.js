const Route = require("../structs/Route");

class Messages extends Route {
  constructor(server) {
    super("get", "messages", server);
  }

  async execute(req, res) {
    // error 0 = success, 1 = no token, 2 = invalid token, 3 = channel, 4 = invalid channel, 5 = user not in channel
    const re = {error: 0};
    const token = req.get("Authorization");
    if (!token) {
      re.error = 1;
      res.send(re);
      return;
    }

    const result = await this.server.db.query("SELECT * FROM credentials WHERE token = ?", [token]);
    if (result.res.length === 0) {
      re.error = 2;
      res.sent(re);
      return;
    }

    let channelId;
    if (!req.query.channel || isNaN(channelId = parseInt(req.query.channel))) {
      re.error = 3;
      res.send(re);
      return;
    }

    const channel = await this.server.db.query("SELECT * FROM channels WHERE id = ?", [channelId]);
    if (channel.res.length === 0) {
      re.error = 4;
      res.send(re);
      return;
    }

    if (!channel.res.some((ch) => ch.user === result.res[0].id)) {
      re.error = 5;
      res.send(re);
      return;
    }

    const users = channel.res.map((ch) => ch.user);
    const usernames = await this.server.db.query
      (`SELECT username, id FROM credentials WHERE id in (${"?".repeat(users.length).split("").join(", ")})`, users);

    const timestamp = req.query.timestamp || Date.now();
    const messages = await this.server.db.query
      ("SELECT * FROM messages WHERE timestamp < ? AND channel = ? ORDER BY timestamp DESC LIMIT 50", [timestamp, channelId]);
    re.messages = messages.res;
    re.usernames = usernames.res;
    res.send(re);

  }
}

module.exports = Messages;