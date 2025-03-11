const SafeCoder        = require('../builded/SafeCoder.js');
const testReadAndWrite = require('./testReadAndWrite.js');

function random(signed) {
  const maxUint64 = (1n << (signed ? 63n : 64n)) - 1n; // 2^64 - 1
  let res = 0n;

  // Generate 8 random bytes (64 bits)
  for (let i = 0; i < 8; i++) {
		res = (res << 8n) | BigInt(Math.floor(Math.random() * 256));
  }
  res =  res & maxUint64; // Ensure it is within the 64-bit range
  
  if(signed && Math.random()>0.5){
	  res = -1n * res;
  }
  return res;
}

module.exports = function(trials=100500, coder=new SafeCoder(100)){
	console.log(coder.constructor.name, 'bigInt tests:');
	['U',''].forEach(sign=>{
		['LE', 'BE'].forEach(endian=>{
			testReadAndWrite({trials, coder, 
				type   : `Big${sign}Int64${endian}`, 
				random : random.bind(null, !sign), 
				bytes  : 8,
			});
		});
	})
	console.log(coder.constructor.name, 'bigInt test passed;');
}

if(require.main === module) module.exports(); //if file runned directly
