const tor = require('@deadcanaries/granax')();

const port = process.env.PORT || 3000;

tor.on('ready', function() {
  tor.createHiddenService(`127.0.0.1:${port}`, (err, result) => {
    console.info(`Forwarding requests to: 127.0.0.1:${port}`);
    console.info(`Service URL: ${result.serviceId}.onion`);
  });
});
tor.on('error', function(err) {
  console.error(err);
});
