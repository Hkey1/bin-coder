const SafeCoder = require('./dist/SafeCoder.js');
const FastCoder = require('./dist/FastCoder.js');

module.exports  = {SafeCoder, FastCoder, ...require('./dic/index.js')}; 