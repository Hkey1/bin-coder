const assert           = require('node:assert');
const SafeCoder        = require('../dist/SafeCoder.js');
const randomIntFromTo  = require('./randomIntFromTo.js');
const testReadAndWrite = require('./testReadAndWrite.js');


function randomIntBits(bits, signed=false){
	return randomIntFromTo(
		signed ? -1*Math.pow(2, bits-1) : 0, 
		Math.pow(2, bits - +signed) -1
	);
}


module.exports = function(trials=100500, coder=new SafeCoder(100)){
	console.log(coder.constructor.name, 'int tests:');
	[...[1,2,3,4,5,6].map(bytes=>8*bytes),1,2,3,4,5,6,7,'X'].forEach(bits=>{
		const dynamic  = bits==='X';
		((dynamic || bits<=7) ? ['U'] : ['U','']).forEach(sign=>{
			((!dynamic && bits<=8) ? [''] : ['LE', 'BE']).forEach(endian=>{
				testReadAndWrite({trials, coder, 
					type     : `${sign}Int${bits}${endian}`, 
					random   : ()=>randomIntBits(dynamic ? randomIntFromTo(1, 6)*8 : bits, !sign), 
					minBytes : dynamic ? 1    : Math.floor(bits/8),
					maxBytes : dynamic ? 9    : Math.floor(bits/8),
					bitPos   : bits<=7 ? bits : 0, 
				});
			})
		});
	});
	[1,2,3,4,5,6].forEach(bytes=>{
		['U',''].forEach(sign=>{
			['LE', 'BE'].forEach(endian=>{
				testReadAndWrite({coder, bytes,
					type   : `${sign}Int${endian}`, 
					trials : Math.ceil(trials/6),
					arg1   : bytes, 
					random : ()=>randomIntBits(8*bytes, !sign), 
				});
			});
		});
	});
	[1,2,3,4,5,6,7].forEach(bits=>{
		testReadAndWrite({coder,
			bytes  : 0,
			type   : `MicroUInt`, 
			trials : Math.ceil(trials/6),
			random : ()=>randomIntBits(bits, false),
			arg1   : bits, 
			bitPos : bits,
		});
	});
	for(let i=0; i<trials/3; i++){		
		let remain = 8;
		const data = [];
		while(remain!=0){
			const bits = randomIntFromTo(1, remain===8 ? 7 : remain);
			const val  = randomIntBits(bits, false);
			remain-= bits;
			data.push({bits, val})
		}
		
		const pos0 = randomIntFromTo(0, coder.length - 1);
					
		coder.bitPos = 0;
		coder.pos    = pos0;
		data.forEach(({bits, val})=>{
			if(Math.random()>0.5){
				coder['writeNextMicroUInt'](val, bits);
			} else {			
				coder['writeNextUInt'+bits](val);
			}
		})
		assert.equal(coder.bitPos, 0);
		assert.equal(coder.pos, pos0+1);
		
		coder.bitPos = 0;
		coder.pos    = pos0;
		data.forEach(({bits, val})=>{
			const read = Math.random()>0.5 
				? coder['readNextMicroUInt'](bits)
				: coder['readNextUInt'+bits]();
			assert.equal(read, val);
		})
		assert.equal(coder.bitPos, 0);
		assert.equal(coder.pos, pos0+1);		
	}
	
	console.log(coder.constructor.name, 'int tests passed;');
}

if(require.main === module) module.exports(); //if file runned directly
