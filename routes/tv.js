var express = require('express');
var router = express.Router();

const tvImpl = require(__basedir + '/control/tv');

router.post('/turnOn', function(req, res, next) {
  tvImpl.turnOn();
  res.status(200).send();
});

router.post('/turnOff', function(req, res, next) {
  tvImpl.turnOff();
  res.status(200).send();
});

module.exports = router;
