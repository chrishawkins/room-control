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
  }

  turnOn() {
    this._set('PowerStatus', true)
      .then(() => console.log('successfully sent command'));
  }

  turnOff() {
    this._set('PowerStatus', false)
      .then(() => console.log('successfully sent command'));
  }

  _set(property, param) {
    let commandConfig = CommandMap[property];
    let paramInt = +param;
    let paramStr = ''+paramInt;
    let paramPadded = paramStr.padStart(16, '0');
    return this._sendCommandTCP('*SC' + commandConfig.fourCC + paramPadded);
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
      this._client.on('data', function(data) {
      	console.log('Received: ' + data);
      });
      this._client.on('error', function(error) {
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
