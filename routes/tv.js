var express = require('express');
var router = express.Router();

const tvImpl = require(__basedir + '/control/tv');

router.post('/sayHi', function(req, res, next) {
  tvImpl.sayHi();
  res.status(200).send();
});

module.exports = router;
