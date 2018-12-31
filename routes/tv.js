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
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.post('/volume/:value', function(req, res, next) {
  tvImpl.setVolume(parseInt(req.params.value)).then(() => {
    res.sendStatus(200);
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.post('/incrementVolume/:value', function(req, res, next) {
  tvImpl.incrementVolume(parseInt(req.params.value)).then(() => {
    res.sendStatus(200);
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.get('/input', function(req, res, next) {
  tvImpl.getInput().then(input => {
    res.send(input);
  }).catch(error => {
    res.status(500).send(error);
  });
});

router.post('/input/:input', function(req, res, next) {
  tvImpl.setInput(req.params.input).then(input => {
    res.send(input);
  }).catch(error => {
    res.status(500).send(error);
  });
});

module.exports = router;
