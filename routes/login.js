const Route = require("../structs/Route");

class Login extends Route {
  constructor(server) {
    super("get", "login", server);
  }

  async execute(req, res) {
    // error 0 = success, 1 = username or password incorrect, 2 = no username or password given
    const re = {error: 0};
    if (!req.query.username || !req.query.password) {
      re.error = 2;
      res.send(re);
      return;
    }

    const ret = await this.server.db.query("SELECT * FROM credentials WHERE username = ?", [req.query.username]);
    if (ret.res.length === 0) {
      re.error = 1;
      res.send(re);
      return;
    }
    const hash = this.server.crypto.createHash("sha256").update(req.query.password).digest("hex");
    delete req.query.password;
    const account = ret.res[0];
    if (hash !== account.password) {
      re.error = 1;
      res.send(re);
      return;
    }
    re.token = account.token;
    // TODO: Kick off old sessions
    res.send(re);
  }
}

module.exports = Login;