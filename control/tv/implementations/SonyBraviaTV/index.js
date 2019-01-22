const fetch = require('node-fetch');
const xmlbuilder = require('xmlbuilder');
const InputMap = require('./InputMap.json');
const AppMap = require('./AppMap.json');
const CommandMap = require('./CommandMap.json');

const SYSTEM_SERVICE = 'system';
const AUDIO_SERVICE = 'audio';
const AV_CONTENT_SERVICE = 'avContent';
const APP_SERVICE = 'appControl';

class SonyBraviaTV {

  constructor(config) {
    this.ip = config.ip;
    this.psk = config.preSharedKey;
    this.port = config.port || 80;
    this.id = 0;
  }

  turnOn() {
    return this._sendAPICommand(
      SYSTEM_SERVICE,
      'setPowerStatus',
      [{ status: true }],
    );
  }

  turnOff() {
    return this._sendAPICommand(
      SYSTEM_SERVICE,
      'setPowerStatus',
      [{ status: false }],
    );
  }

  setVolume(volume) {
    return this._sendAPICommand(
      AUDIO_SERVICE,
      'setAudioVolume',
      [{ volume: '' + volume, target: 'speaker' }],
    );
  }

  getVolume() {
    return new Promise((resolve, reject) => {
      this._sendAPICommand(
        AUDIO_SERVICE,
        'getVolumeInformation',
      ).then(result => {
        for (var i in result) {
          if (result[i].target === 'speaker') {
            return resolve(result[i].volume);
          }
        }
        return reject('Speaker not found');
      }).catch(error => {
        reject(error);
      });
    });
  }

  incrementVolume(increment) {
    if (increment >= 0) {
      increment = '+' + increment;
    }
    return this.setVolume(increment);
  }

  getInput() {
    return new Promise((resolve, reject) => {
      this._sendAPICommand(
        AV_CONTENT_SERVICE,
        'getPlayingContentInfo',
      ).then(result => {
        resolve(result.title.replace(' ', ''));
      }).catch(error => {
        if (error.code === 7) {
          return resolve('Unknown');
        }
        reject(error);
      });
    });
  }

  setInput(inputValue) {
    return this._sendAPICommand(
      AV_CONTENT_SERVICE,
      'setPlayContent',
      [{ uri: InputMap[inputValue] }],
    )
  }

  startApp(identifier) {
    return this._sendAPICommand(
      APP_SERVICE,
      'setActiveApp',
      [{ uri: AppMap[identifier] }],
    );
  }

  setMute(value) {
    return this._sendAPICommand(
      AUDIO_SERVICE,
      'setAudioMute',
      [{ status: value }],
    );
  }

  sendRemoteCommand(command) {
    return this._sendIRCCCommand(CommandMap[command]);
  }

  printApps() {
    return this._sendAPICommand(
      APP_SERVICE,
      'getApplicationList'
    ).then(result => console.log(result))
    .catch(error => console.error(error));
  }

  _sendAPICommand(service, command, params = []) {
    return this._sendCommandWithBody(
      service, 
      JSON.stringify({
        method: command,
        id: ++this.id,
        params: params,
        version: "1.0",
      }),
      { 'Content-Type': 'application/json; charset=UTF-8' }
    ).then(response => response.json())
    .then(response => {
      return new Promise((resolve, reject) => {
        if (response.error && (!response.result || response.result.length === 0)) {
          reject({ code: response.error[0] });
        } else {
          resolve(response.result[0]);
        }
      });
    });
  }

  _sendIRCCCommand(command) {
    return this._sendCommandWithBody(
      'IRCC',
      xmlbuilder
        .create('s:Envelope')
          .att('xmlns:s', 'http://schemas.xmlsoap.org/soap/envelope/')
          .att('s:encodingStyle', 'http://schemas.xmlsoap.org/soap/encoding/')
          .ele('s:Body')
            .ele('u:X_SendIRCC', {'xmlns:u': 'urn:schemas-sony-com:service:IRCC:1'})
              .ele('IRCCCode', {}, command)
        .doc().end({ pretty: true}),
      {
        'SOAPACTION': '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
        'Content-Type': 'text/xml; charset=UTF-8'
      }
    );
  }

  _sendCommandWithBody(service, body, additionalHeaders = {}) {
    let headers = Object.assign({ 'X-Auth-PSK': this.psk }, additionalHeaders);
    console.log('Headers: ' + JSON.stringify(headers));
    console.log('Sending: ' + body);
    return fetch('http://' + this.ip + ':' + this.port + '/sony/' + service, {
      method: 'post',
      headers: headers,
      body: body,
    });
  }
}

module.exports = SonyBraviaTV;
