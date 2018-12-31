const TcpClientManager = require(__basedir + '/util/TcpClientManager.js');
const CommandMap = require('./CommandMap.json');

class SonyBraviaTV {

  constructor(config) {
    this.ip = config.ip;
    this.connection = {
      ip: config.ip,
      port: config.port || 20060,
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
    if (!this._tcpManager) {
      this._tcpManager = new TcpClientManager(
        this.connection.ip,
        this.connection.port,
        message => this._onMessage(message));
    }

    return this._tcpManager.getClient()
      .then(client => client.sendCommand(command))
      .catch(error => console.error("Could not communicate with Bravia: " + error));
  }

  _onMessage(message) {
    Object.keys(this.filters).forEach(filter => {
      let fourCC = message.substring(3, 7);
      console.log("fourcc: " + fourCC);
      if (fourCC === filter) {
        this.filters[filter](message);
      }
    })
  }
}

module.exports = SonyBraviaTV;
