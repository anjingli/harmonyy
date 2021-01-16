const Route = require("../structs/Route");

const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const generateToken = () => {
  const s = [];
  for (let i = 0; i < 32; i++) s.push(ALPHA[parseInt(Math.random() * ALPHA.length)]);
  return s.join("");
}

class Register extends Route {
  constructor(server) {
    super("post", "register", server);
  }

  async execute(req, res) {
    // error 0 = success, 1 = username taken, 2 = no username or password given
    const re = {error: 0};
    if (!req.body.username || !req.body.password) {
      re.error = 2;
      res.send(re);
      return;
    }

    const ret = await this.server.db.query("SELECT id FROM credentials WHERE username = ?", [req.body.username]);
    if (ret.res.length > 0) {
      re.error = 1;
      res.send(re);
      return;
    }

    const hash = this.server.crypto.createHash("sha256").update(req.body.password).digest("hex");
    const token = generateToken();
    delete req.body.password;
    await this.server.db.query("INSERT INTO credentials (username, password, token) VALUES (?, ?, ?)", [req.body.username, hash, token]);
    res.send(re);
  }
}

module.exports = Register;