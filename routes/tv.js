var express = require('express');
var router = express.Router();

const tvImpl = require(__basedir + '/control/tv');

router.post('/turnOn', function(req, res, next) {
  tvImpl.turnOn().then(() => {
    res.sendStatus(200);
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.post('/turnOff', function(req, res, next) {
  tvImpl.turnOff().then(() => {
    res.status(200).send();
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.get('/volume', function(req, res, next) {
  tvImpl.getVolume().then(volume => {
    res.send('' + volume);
  });
});

router.post('/volume/:value', function(req, res, next) {
  tvImpl.setVolume(res.params.value).then(() => {
    res.sendStatus(200);
  });
});

module.exports = router;
