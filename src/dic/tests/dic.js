const assert                 = require('node:assert');
const classes                = require('../index.js');
const {FastCoder, SafeCoder} = require('../../index.js');

const maxLen   = 256;
const trials   = 500;
const maxSends = 101;
const maxVals  = 101;

function randomIntFromTo(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDigitsString(maxLen=12){
	let n = randomIntFromTo(1, maxLen);
	let s = '';
	for(let j=0; j<n; j++){
		s += ''+randomIntFromTo(0, 9)
	}
	return s;
}
function randomArrayItem(arr) {
	return arr[randomIntFromTo(0, arr.length-1)]	
}
function compareArrays(a,b){
	assert.equal(a.length,b.length);
	for(let i=0; i<a.length; i++){
		assert.equal(a[i],b[i])
	}
}
function randomFloat(){
	let res = 0;
	if(Math.random()<0.01){
		res = 0;
	} else if(Math.random()<0.01){
		res = +Infinity;
	//} else if(Math.random()<0.01){
	//	res = NaN;		
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
	if(Math.random()>0.6){
		res *= -1;
	}
	return res;	
}
function randomValues(count, random = ()=>Math.random(), repeatProb=0.5){
	const res = [];
	const map = new Map();
			
	for(let v=0; v<count; v++){
		let val = randomArrayItem(res);
		if(Math.random()>=repeatProb || v===0){
			val = random();
			while(map.has(val)){
				val = random();
			}
		}
		res.push(val);
		map.set(val, v);
	}
	return res;
}

console.log('DicCoder test:');
for(let t=0; t<trials; t++){
	const len     = randomIntFromTo(3, maxLen);
	const nSends  = randomIntFromTo(1, maxSends);
	const encoder = new classes.DicCoder(len, true);
	const decoder = new classes.DicCoder(len, false);
	for(let s=0; s<nSends; s++){
		const values   = randomValues(randomIntFromTo(1, Math.min(len-1, maxVals)));
		const indexes  = values.map(val=>{
			const has   = encoder.has(val);
			const index = encoder.encode(val);
			if(!has){
				decoder.set(index, val);
			}
			return index;
		})
		compareArrays(values, indexes.map(index=>decoder.decode(index)));
	}
}
console.log('DicCoder test passed;');


	


const f32 = new Float32Array(1);
const dataTypes = {
	UInt32LE : ()=>randomIntFromTo(0, Math.pow(2, 32)-1), 
	Int16BE  : ()=>randomIntFromTo(-Math.pow(2, 15), Math.pow(2, 15)-1),
	DoubleLE : ()=>randomFloat(),  
	UDoubleH : ()=>Math.abs(randomFloat()),
	FloatBE  : ()=>{
		f32[0] = randomFloat();
		return f32[0];
	}, 
};

[128, 255].forEach(len=>{
	[false, true].forEach(saveLoad=>{
		[false, true].forEach(useInitValues=>{
			const className = `DicCoder${len}`;
			const testName  = className + (saveLoad ? '.saveLoad': '') + (useInitValues ? '.initValues': '')+ ' test';
			const Class     = classes[className];
			console.log(`${testName}:`);
			const alloc    = maxVals*11 + len*11;
				
			for(let t=0; t<trials; t++){				
				const nSends   = randomIntFromTo(1, maxSends);
				const coder    = Math.random()>0.5 ? new FastCoder(alloc) : new SafeCoder(alloc);
				const dataType = randomArrayItem(Object.keys(dataTypes));
				const random   = dataTypes[dataType];
				const initVals = useInitValues ? randomValues(randomIntFromTo(1, len), random, 0) : undefined;
				const encoder  = new Class(coder, dataType, true,  initVals);
				const decoder  = new Class(coder, dataType, false, initVals);
				for(let s=0; s<nSends; s++){
					const values = randomValues(randomIntFromTo(1, Math.min(len-1, maxVals)), random);

					coder.pos    = 0;
					if(saveLoad){
						values.forEach(val=>encoder.encode(val));
						encoder.saveNext()
					}
					values.forEach(val=>encoder.writeNext(val));
					//console.log(values.map(val=>encoder.encode(val)));

					coder.pos = 0;
					if(saveLoad){
						decoder.loadNext()
					}
					values.forEach(val=>assert.equal(decoder.readNext(), val));
				}
			}
			console.log(`${testName} passed;`);
		});
	});
});


