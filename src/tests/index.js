const SafeCoder = require('../builded/SafeCoder.js');
const FastCoder = require('../builded/FastCoder.js');

const trials = 100500;
[SafeCoder, FastCoder].forEach(Class=>{	
	const coder = new Class(100);
	['bigInt', 'int', 'float', 'str'].forEach(fn=>{
		require(`./${fn}.js`)(trials, coder)
	});
});
