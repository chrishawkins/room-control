const net = require('net');
const CommandMap = require('./CommandMap.json');

class SonyBraviaTV {

  constructor(config) {
    this.ip = config.ip;
    this.connection = {
      ip: config.ip,
      port: config.port || 20060,
      lifetime: config.lifetime || 30,
    };
    this.filters = {};
  }

  turnOn() {
    return this._set('PowerStatus', true);
  }

  turnOff() {
    return this._set('PowerStatus', false);
  }

  getPowerStatus() {
    return this._get('PowerStatus');
  }

  setVolume(volume) {
    return this._set('AudioVolume', volume);
  }

  getVolume() {
    return this._get('AudioVolume');
  }

  incrementVolume(increment) {
    return this.getVolume().then(volume => {
      return this.setVolume(volume + increment);
    });
  }

  _set(property, param) {
    let commandConfig = CommandMap[property];
    let paramInt = +param;
    let paramStr = ''+paramInt;
    let paramPadded = paramStr.padStart(16, '0');
    return this._sendCommandTCP('*SC' + commandConfig.fourCC + paramPadded);
  }

  _get(property) {
    let commandConfig = CommandMap[property];
    let paramPadded = '#'.repeat(16);
    var resolved = false;
    return new Promise((resolve, reject) => {
        this.filters[commandConfig.fourCC] = data => {
          if (!resolved) {
            resolved = true;
            console.log('substr' + data.substring(7, 23));
            resolve(parseInt(data.substring(7, 23)));
          }
        };
        this._sendCommandTCP('*SE' + commandConfig.fourCC + paramPadded).catch(error => {
          reject(error);
        });
      });
  }

  _sendCommandTCP(command) {
    console.log(`Bravia send: ${command}`);
    return this._createClientIfNeeded()
      .then(client =>
        new Promise((resolve, reject) => {
          try {
            client.write(command + "\n");
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      ).catch(e => {
        console.error('Failed to communicate with Bravia');
        console.error(e);
      });
  }

  _messageReceived(message) {
    Object.keys(this.filters).forEach(filter => {
      let fourCC = message.toString().substring(3, 7);
      console.log("fourcc: " + fourCC);
      if (fourCC === filter) {
        this.filters[filter](message.toString());
      }
    })
  }

  _createClientIfNeeded() {
    if (this._client) {
      return new Promise((resolve, reject) => {
        resolve(this._client);
      });
    }
    return new Promise((resolve, reject) => {
      var resolved = false;
      this._client = new net.Socket();
      this._client.connect(this.connection.port, this.connection.ip, () => {
        console.log('Bravia TV Connected');
        resolved = true;
        resolve(this._client);
      });
      this._client.on('data', data => {
      	console.log('Received: ' + data);
        this._messageReceived(data);
      });
      this._client.on('error', error => {
        console.error('TCP error: ' + error);
        console.log('Encountered TCP error, closing connection');
        this._client.close();
        this._client = null;
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });
      this._client.on('close', () => {
      	console.log('Connection closed');
        this.client = null;
      });
    });
  }
}

module.exports = SonyBraviaTV;
