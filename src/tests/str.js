const assert           = require('node:assert');
const crypto           = require('node:crypto');
const SafeCoder        = require('../builded/SafeCoder.js');
const randomIntFromTo  = require('./randomIntFromTo.js');
const testReadAndWrite = require('./testReadAndWrite.js');

function randomHexString(length) {
  return crypto.randomBytes(Math.ceil(length/2)+1).toString('hex').substring(0, length);
}

module.exports = function(trials=100500, coder=new SafeCoder(100)){
	console.log(coder.constructor.name, 'float tests:');
	['Buffer', 'String', 'Json'].forEach(type0=>{
		['','XLE', 'XBE'].forEach(endian=>{
			for(let i=0; i<5; i++){
				let len = randomIntFromTo(type0==='Json' ? 3 : 1, coder.buf.length - (endian==='' ? 0 : 9) - 1)
				
				testReadAndWrite({coder,
					trials   : Math.round(trials/5),		
					type     : type0+endian, 
					random   : ()=>{
						const str = randomHexString(len- (type0==='Json' ? 2 : 0))
						return type0==='Buffer' ?  Buffer.from(str, 'utf8') : str;
					}, 
					minBytes : len + (endian==='' ? 0 : 1),
					maxBytes : len + (endian==='' ? 0 : 9),
					arg1         : endian==='' ? len : undefined,
					arg1ReadOnly : true,
				});				
			}
		});
	});
	console.log(coder.constructor.name, 'bigInt test passed;');
}
if(require.main === module) module.exports(); //if file runned directly