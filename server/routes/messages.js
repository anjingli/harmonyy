const Route = require("../structs/Route");

class Messages extends Route {
  constructor(server) {
    super("get", "messages", server);
  }

  async execute(req, res) {
    // const result = await this.server.db.query("SELECT * FROM messages WHERE author = ?", [req.query.author]);
    const token = req.get("Authorization");
    if (!token){
      res.send("Error");
      return;
    }

    const result = await this.server.db.query("SELECT * FROM credentials WHERE token = ?", [token]);
    if (result.res.length === 0){
      res.sent("Error");
      return;
    }

    let channelId;
    if (!req.query.channel || isNaN(channelId = parseInt(req.query.channel))){
      res.send("Error");
      return;
    }

    const channel = await this.server.db.query("SELECT * FROM channels WHERE id = ? AND user = ?",
      [channelId, result.res[0].id]);
    if (channel.res.length === 0){
      res.send("Error");
      return;
    }

    const timestamp = req.query.timestamp || Date.now();
    const messages = await this.server.db.query
      ("SELECT * FROM messages WHERE timestamp < ? AND channel = ? ORDER BY timestamp DESC LIMIT 50", [timestamp, channelId]);
    res.send(messages.res);

  }
}

module.exports = Messages;