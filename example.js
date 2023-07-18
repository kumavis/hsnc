const Readline = require('readline')
const { start } = require('./index.js')

main()

async function main () {
  const { tor, port, torSocks, serviceId, connect } = await start({ port: 3000, debug: true })

  tor.on('error', function(err) {
    console.error(err);
  });

  console.info(`TorSocks listening on ${torSocks.port}!`);
  console.info(`Forwarding requests to: 127.0.0.1:${port}`);
  console.info(`Service URL: ${serviceId}.onion`);

  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const remoteService = await new Promise(resolve => 
    readline.question('Enter remote service? (eg:a5iruzwim3pt7vnh6qlpifaoebdlqainggtvdambx6oojm75boi3j7ad.onion)', resolve)
  )
  readline.close();

  console.info(`Connecting to ${remoteService}...`);
  const { socket } = await connect({ host: remoteService })
  socket.setEncoding('utf8');
  socket.on('data', (data) => {
    console.log(data);
  });
  
  console.info(`Connected. Sending hello...`);
  socket.write('haay wuurl');
}