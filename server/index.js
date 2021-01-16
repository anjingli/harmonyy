const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();

class Server {
  constructor(express, config) {
    this.express = express;
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: true}));

    this.routes = [];
    this.config = require(config);
    this.crypto = require("crypto");
  }

  init() {
    for (const route of fs.readdirSync("./routes")) {
      const Route = require(`./routes/${route}`);
      this.routes.push(new Route(this));
    }
    for (const route of this.routes) {
      this.express[route.protocol](`/${route.endpoint}`, upload.array(), (req, res) => route.execute(req, res));
    }

    const db = mysql.createConnection({
      host: "localhost",
      user: this.config.db.username,
      password: this.config.db.password,
      database: this.config.db.name
    });
    db.connect();

    this.db = {
      query: (msg, args = []) => {
        return new Promise((resolve, reject) => {
          db.query(msg, args, (err, res, fields) => {
            if (err) reject(err);
            else resolve({res, fields});
          });
        });
      },
      db
    };

  }
}

const server = new Server(express(), "./config.json");
const port = 80;

server.init();

server.express.listen(port, () => {
  console.log("Online");
});