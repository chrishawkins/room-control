var express = require('express');
var router = express.Router();

const xbox = require(__basedir + '/control/xbox');

router.post('/turnOn', function(req, res, next) {
  xbox.turnOn().then(() => {
    res.sendStatus(200);
  }).catch(error => {
    res.status(500).send(error);
  });
});

module.exports = router;
