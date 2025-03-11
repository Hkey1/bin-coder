const assert           = require('node:assert');
const SafeCoder        = require('../builded/SafeCoder.js');
const randomIntFromTo  = require('./randomIntFromTo.js');
const testReadAndWrite = require('./testReadAndWrite.js');


function randomDigitsString(maxLen=12){
	let n = randomIntFromTo(1, maxLen);
	let s = '';
	for(let j=0; j<n; j++){
		s += ''+randomIntFromTo(0, 9)
	}
	return s;
}

const tmp = new Float32Array(1);
function randomFloat(signed=true, is32bits=false){
	let res = 0;
	if(Math.random()<0.01){
		res = 0;
	} else if(Math.random()<0.01){
		res = +Infinity;
	} else if(Math.random()<0.01){
		res = NaN;		
	} else if(Math.random()<0.5){
		if(Math.random()<0.2){
			res = parseFloat(randomDigitsString(7));
		} else if(Math.random()<0.4){
			res = parseFloat(randomDigitsString(6)+'.'+randomDigitsString(6));
		} else {
			res = parseFloat(randomDigitsString(7))* Math.pow(10, randomIntFromTo(-17, 10));
		}
	} else {
		res = Math.random();
		if(Math.random()<0.9){
			res *= Math.pow(10, randomIntFromTo(-10, 10))
		}
	}
	
	if(signed && Math.random()>0.6){
		res *= -1;
	}
	if(is32bits){
		tmp[0] = res;
		res    = tmp[0];
	}
	
	return res;	
}


module.exports = function(trials=100500, coder=new SafeCoder(100)){
	console.log(coder.constructor.name, 'float tests:');
	['Float', 'Double', 'UDoubleH'].forEach(type0=>{
		((type0==='UDoubleH') ? [''] : ['LE', 'BE']).forEach(endian=>{
			testReadAndWrite({trials, coder, 
				type     : type0+endian, 
				random   : ()=>randomFloat(type0!=='UDoubleH', type0==='Float'), 
				minBytes : type0==='Float' ? 4 : (type0==='UDoubleH' ? 2 : 8),
				maxBytes : type0==='Float' ? 4 : 8,
			});
		});
	});
	console.log(coder.constructor.name, 'bigInt test passed;');
}
if(require.main === module) module.exports(); //if file runned directly
