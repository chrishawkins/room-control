const express = require('express');
const router = express.Router();

const config = require(__basedir + '/config/config');
const tv = require(__basedir + '/control/tv');
const xbox = require(__basedir + '/control/xbox');

router.post('/turnOnXboxAndTV', function(req, res, next) {
  Promise.all([
    xbox.turnOn(),
    tv.turnOn()
      .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
      .then(() => tv.setInput(config.scripts.xboxInput)),
  ]).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    res.status(500).send(error);
  });
});

module.exports = router;
