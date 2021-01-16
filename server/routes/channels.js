const Route = require("../structs/Route");

class Channels extends Route {
  constructor(server) {
    super("get", "channels", server);
  }

  async execute(req, res) {
    // error 0 = success, 1 = invalid token, 2 = no token
    const re = {error: 0};
    const token = req.get("Authorization");
    if (!token) {
      re.error = 2;
      res.send(re);
      return;
    }
    const ret = await this.server.db.query("SELECT * FROM credentials WHERE token = ?", [token]);
    if (ret.res.length === 0) {
      re.error = 1;
      res.send(re);
      return;
    }
    
    const user = ret.res[0];
    const channels = await this.server.db.query("SELECT * FROM channels WHERE user = ?", [user.id]);
    re.channels = channels.res;
    res.send(re);


  }
}