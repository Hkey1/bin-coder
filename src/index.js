const SafeCoder     = require('./builded/SafeCoder.js');
const FastCoder     = require('./builded/FastCoder.js');
const AbstractCoder = require('./AbstractCoder.js');

module.exports  = {SafeCoder, FastCoder, AbstractCoder, ...require('./dic/index.js')}; 