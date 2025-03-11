const SafeCoder = require('./builded/SafeCoder.js');
const FastCoder = require('./builded/FastCoder.js');

module.exports  = {SafeCoder, FastCoder, ...require('./dic/index.js')}; 