const randomIntFromTo = require('./randomIntFromTo.js');

function checkPos(coder, where, pos0, minBytes, maxBytes, bitPos){
	if(coder.bitPos!==bitPos)       throw new Error(`${where}: coder.bitPos = ${coder.bitPos} !== ${bitPos}`);
	if(coder.pos < pos0 + minBytes) throw new Error(`${where}: coder.pos < pos0 + minBytes : ${coder.pos} < ${pos0} + ${minBytes}`)
	if(coder.pos > pos0 + maxBytes) throw new Error(`${where}: coder.pos > pos0 + maxBytes : ${coder.pos} < ${pos0} + ${maxBytes}`)
}
	
module.exports = function testReadAndWrite({trials, coder, type, random, minBytes, maxBytes, bitPos, bytes, arg1, arg1ReadOnly}) {
	minBytes ??= bytes ?? maxBytes;
	maxBytes ??= bytes ?? minBytes;
	bitPos   ??= 0
	
	function write(val, pos0){
		if(coder.buf['write'+type] && Math.random()>0.8){
			if(arg1===undefined || arg1ReadOnly){
				coder.buf['write'+type](val, pos0);
			} else {
				coder.buf['write'+type](val, pos0, arg1);
			}
		} else {
			coder.bitPos = 0;
			coder.pos    = pos0;
			if(arg1===undefined || arg1ReadOnly){
				coder['writeNext'+type](val);
			} else {				
				coder['writeNext'+type](val, arg1);
			}
			checkPos(coder, type+' write', pos0, minBytes, maxBytes, bitPos);
		}
	}
	function read(pos0){
		if(coder.buf['read'+type] && Math.random()>0.8){
			return (arg1===undefined
				? coder.buf['read'+type](pos0)
				: coder.buf['read'+type](pos0, arg1)
			);
		} else {
			coder.bitPos = 0;
			coder.pos    = pos0;
			const res    = (arg1===undefined 
				? coder['readNext'+type]() 
				: coder['readNext'+type](arg1)
			);
			checkPos(coder, type+' read', pos0, minBytes, maxBytes, bitPos);
			return res;
		}
	}
	
	console.log(type + (arg1?' '+arg1:''), 'test:')
	for(let i=0; i<trials; i++){
		const val  = random();
		const pos0 = randomIntFromTo(0, coder.length - (maxBytes||1));

		write(val, pos0);
		const res   = read(pos0);
		if(res!==val
		&& (!isNaN(res) || !isNaN(val))
		&& (!(res instanceof Buffer) || !(val instanceof Buffer) || Buffer.compare(val, res)!==0)){
			throw new Error(`${type} : res!==val : ${res}!==${val}`)	
		}
	}
	console.log(type+ (arg1?' '+arg1:''), 'test passed;')
}