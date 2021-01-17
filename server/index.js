const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const ws = require("ws");
const http = require("http");

class Server {
  constructor(express, config) {
    this.express = express;
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: true}));
    this.express.use(cors());
    this.express.use(require("express").static("public"));
    this.http = http.createServer(this.express);

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

    this.wss = {};
    const Messenger = require("./websocket/messenger");
    this.wss.messages = {
      server: new ws.Server({server: this.http, port: 8080, path: "/messages"}),
      handler: new Messenger(this)
    }
    this.wss.messages.server.on("connection", (ws) => {
      this.wss.messages.handler.onConnect(ws);
    });

    this.http.listen(80);

  }
}

const server = new Server(express(), "./config.json");

server.init();