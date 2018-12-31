const config = require(__basedir + '/config/config');
const TvImpl = require('./implementations/' + config.network.tv.implementation);
module.exports = new TvImpl(config.network.tv);
