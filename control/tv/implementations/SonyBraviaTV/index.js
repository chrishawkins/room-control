const TcpClientManager = require(__basedir + '/util/TcpClientManager.js');
const CommandMap = require('./CommandMap.json');

const Inputs = {
  TV: {
    label: "TV",
    range: 0,
  },
  HDMI: {
    label: "HDMI",
    range: 100000000,
  },
  SCART: {
    label: "SCART",
    range: 200000000,
  },
  COMPOSITE: {
    label: "Composite",
    range: 300000000,
  },
  COMPONENT: {
    label: "Component",
    range: 400000000,
  },
  MIRRORING: {
    label: "Mirroring",
    range: 500000000,
  },
  PC: {
    label: "PC",
    range: 600000000,
  },
  UNKNOWN: {
    label: "Unknown",
    range: 700000000,
  }
};

class SonyBraviaTV {

  constructor(config) {
    this.ip = config.ip;
    this.filters = {};
    this._tcpManager = new TcpClientManager(
      config.ip,
      config.port || 20060,
      message => this._onMessage(message));
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

  setVolume(volume) {
    return this._set('AudioVolume', volume);
  }

  getInput() {
    return this._get('Input').then(inputVal => {
      console.log(inputVal);
      return new Promise(resolve => {
        if (inputVal < Inputs.HDMI.range) resolve('TV');
        else if (inputVal < Inputs.SCART.range) resolve(Inputs.HDMI.label + ' ' + (inputVal - Inputs.HDMI.range));
        else if (inputVal < Inputs.COMPOSITE.range) resolve(Inputs.SCART.label + ' ' + (inputVal - Inputs.SCART.range));
        else if (inputVal < Inputs.COMPONENT.range) resolve(Inputs.COMPOSITE.label + ' ' + (inputVal - Inputs.COMPOSITE.range));
        else if (inputVal < Inputs.MIRRORING.range) resolve(Inputs.COMPONENT.label + ' ' + (inputVal - Inputs.COMPONENT.range));
        else if (inputVal < Inputs.PC.range) resolve(Inputs.MIRRORING.label + ' ' + (inputVal - Inputs.MIRRORING.range));
        else if (inputVal < Inputs.UNKNOWN.range) resolve(Inputs.PC.label + ' ' + (inputVal - Inputs.PC.range));
        else resolve(Inputs.UNKNOWN.label + inputVal);
      });
    });
  }

  setInput(inputValue) {
    if (inputValue === Inputs.TV.label) {
      return this._set('Input', 0);
    }
    for (var i in Inputs) {
      if (inputValue.startsWith(Inputs[i].label)) {
        let number = parseInt(inputValue.substring(Inputs[i].label.length));
        if (number != NaN) {
          let inputId = number + Inputs[i].range;
          return this._set('Input', inputId);
        }
      }
    }
    return new Promise((_, reject) => {
      reject('Input not valid: ' + inputValue);
    });
  }

  _set(property, param) {
    let commandConfig = CommandMap[property];
    let paramInt = +param;
    let paramStr = '' + paramInt;
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
            let substr = data.substring(7, 23);
            if (substr === "FFFFFFFFFFFFFFFF") {
              return reject("Unknown error");
            }
            return resolve(parseInt(substr));
          }
        };
        this._sendCommandTCP('*SE' + commandConfig.fourCC + paramPadded).catch(error => {
          reject(error);
        });
      });
  }

  _sendCommandTCP(command) {
    console.log(`Bravia send: ${command}`);

    return this._tcpManager.getClient()
      .then(client => client.sendCommand(command))
      .catch(error => console.error('Could not communicate with Bravia: ' + error));
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
