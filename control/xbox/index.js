const config = require(__basedir + '/config/config');
const TcpClientManager = require(__basedir + '/util/TcpClientManager.js');
const Constants = require('./Constants.json');

const dgram = require('dgram');

class Xbox {

  constructor(config) {
    this.ip = config.ip;
    this.liveId = config.liveId;
  }

  turnOn() {
    let socket = dgram.createSocket('udp4');
    let powerPayload = new Buffer('\x00' + String.fromCharCode(this.liveId.length) + this.liveId.toUpperCase() + '\x00');
    let powerHeader = Buffer.concat([new Buffer('dd0200', 'hex'), new Buffer(String.fromCharCode(powerPayload.length)), new Buffer('\x00\x00')]);
    let powerPacket = Buffer.concat([powerHeader, powerPayload]);

    return this._sendPacket(socket, powerPacket);
  }

  _sendPacket(socket, buffer) {
    return new Promise((resolve, reject) => {
      socket.send(buffer, 0, buffer.length, Constants.xboxPort, this.ip, function(err) {
        socket.close();
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = new Xbox(config.network.xbox);



// <Buffer 00 10 46 44 30 30 46 35 34 32 42 32 46 38 41 35 39 39 00>
// <Buffer c3 9d 02 00 13 00 00>
// <Buffer c3 9d 02 00 13 00 00 00 10 46 44 30 30 46 35 34 32 42 32 46 38 41 35 39 39 00>

// <Buffer 00 10 46 44 30 30 46 35 34 32 42 32 46 38 41 35 39 39 00>
// <Buffer dd 02 00 13 00 00>
// <Buffer dd 02 00 13 00 00 00 10 46 44 30 30 46 35 34 32 42 32 46 38 41 35 39 39 00>
