const socks = require('socks').SocksClient;
const Tor = require('@deadcanaries/granax');

module.exports = {
  start,
}

async function start ({
  port = 3000,
  debug = false
} = {}) {
  const tor = Tor()
  await new Promise(resolve => tor.once('ready', resolve))

  if (debug) {
    tor.addEventListeners(['SIGNAL', 'ADDRMAP'], () => tor.enableDebug());
    tor.on('SIGNAL', function(data) {
      console.log('Got SIGNAL event:', data);
    });
    tor.on('ADDRMAP', function(data) {
      console.log('Got ADDRMAP event:', data);
    });    
  }

  const torSocks = await getSocksInfo(tor);
  const { serviceId } = await createHiddenService(tor, port);

  const connect = async ({ host, port = 80, timeout = 30000 }) => {
    const options = {
      proxy: {
        host: '127.0.0.1',  // localhost
        port: torSocks.port,  // Default Tor SOCKS5 Proxy Port
        type: 5,  // This is for SOCKS5 proxy
      },
      command: 'connect',  // 'connect' for TCP connections
      destination: {
        host,  // The .onion address to connect to
        port,  // The destination port (change to the appropriate port)
      },
      timeout,  // in milliseconds
    };
    
    return await socks.createConnection(options)
  }

  return {
    tor,
    port,
    torSocks,
    serviceId,
    connect,
  }
}

async function getSocksInfo (tor) {
  const result = await new Promise((resolve, reject) =>
    tor.getInfo('net/listeners/socks', (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  );
  const port = parseInt(result.split('"').join('').split(':')[1]);
  return { port }
}

async function createHiddenService (tor, port) {
  const result = await new Promise((resolve, reject) =>
    tor.createHiddenService(`127.0.0.1:${port}`, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  );
  return result
}
