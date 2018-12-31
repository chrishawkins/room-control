const net = require('net');

class TcpClient {

  constructor(ipAddress, port, messageCallback, errorCallback, initCallback) {
    this._socket = new net.Socket();
    this._socket.connect(port, ipAddress, () => {
      initCallback();
    });
    this._socket.on('data', data => {
      console.log('Received: ' + data);
      messageCallback(data);
    });
    this._socket.on('error', error => {
      console.error('TCP error: ' + error);
      errorCallback(error);
      console.log('Encountered TCP error, closing connection');
      this._socket.close();
      this._dead = true;
    });
    this._socket.on('close', () => {
      console.log('Connection closed');
      this._dead = true;
    });
  }

  sendCommand(command) {
    console.log(`TCP send: ${command}`);
    return new Promise((resolve, reject) => {
      try {
        this._socket.write(command + '\n');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

class TcpClientManager {

  constructor(ipAddress, port, messageCallback, errorCallback) {
    this.ipAddress = ipAddress;
    this.port = port;
    this.messageCallback = messageCallback;
    this.errorCallback = errorCallback;
  }

  getClient() {
    if (this._client && !this._client._dead) {
      return new Promise((resolve, reject) => {
        resolve(this._client);
      });
    }
    return new Promise((resolve, reject) => {
      this._client = new TcpClient(
        this.ipAddress,
        this.port,
        message => {
          if (this.messageCallback) {
            this.messageCallback(message.toString());
          }
        },
        error => {
          if (!resolved) {
            resolved = true;
            reject(error);
          } else if (this.errorCallback(error)) {
            this.errorCallback(error);
          } else {
            console.error("Unhandled TCP error " + error);
          }
        },
        () => resolve(this._client),
      );
      resolve(this._client);
    });
  }
}

module.exports = TcpClientManager;
