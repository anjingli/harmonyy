const Route = require("../structs/Route");

class Create extends Route {
  constructor(server) {
    super("post", "create", server);
  }

  async execute(req, res) {
    const token = req.get("Authorization");
    // error 0 = success, 1 = invalid token, 2 = no token given, 3 = invalid username to invite, 4 = no payload, 5 = dm exists
    const re = {error: 0};
    if (!token) {
      re.error = 2;
      res.send(re);
      return;
    }

    const ret = await this.server.db.query("SELECT * FROM credentials WHERE token = ?", [token]);
    if (!ret.res.length) {
      re.error = 1;
      res.send(re);
      return;
    }

    let target;
    try {
      target = req.body.usernames;
    }
    catch (e) {
      target = false;
    }
    if (!target) {
      re.error = 4;
      res.send(re);
      return;
    }
    if (target.length === 1) {
      target = await this.server.db.query("SELECT * FROM credentials WHERE username = ?", target[0]);
      if (!target.res.length) {
        re.error = 3;
        res.send(re);
        return;
      }
      const currentDMs = await this.server.db.query("SELECT * FROM channels WHERE (user = ? OR user = ?) AND dm = 1",
        [ret.res[0].id, target.res[0].id]);
      const dupes = new Set();
      for (const dm of currentDMs.res) {
        if (dupes.has(dm.id)) {
          re.error = 5;
          res.send(re);
          return;
        }
        dupes.add(dm.id);
      }
      const latestID = await this.server.db.query("SELECT highestChannel from meta");
      const id = latestID.res[0].highestChannel + 1;
      await this.server.db.query("UPDATE meta SET highestChannel = ?", [id]);
      await this.server.db.query("INSERT INTO channels VALUES (?, ?, ?, ?)", [id, target.res[0].username, 1, ret.res[0].id]);
      await this.server.db.query("INSERT INTO channels VALUES (?, ?, ?, ?)", [id, ret.res[0].username, 1, target.res[0].id]);
      res.send(re);
      this.server.wss.messages.handler.newChannel([ret.res[0].id, target.res[0].id], id);
    }
    else {
      // TODO: Group chats
    }
  }
}

module.exports = Create;