class Route {
  constructor(protocol, endpoint, server) {
    this.protocol = protocol;
    this.endpoint = endpoint;
    this.server = server;
  }

  async execute(req, res) {

  }
}

module.exports = Route;