const SafeCoder = require('../dist/SafeCoder.js');
const FastCoder = require('../dist/FastCoder.js');

const trials = 1e8;
const bytes  = 100;

const buffer    = Buffer.alloc(bytes);
const safeCoder = new SafeCoder(bytes);
const fastCoder = new FastCoder(bytes);
const coders    = [buffer, safeCoder, fastCoder];

function _calcPerfomance(coder, fn, arg=undefined){
	if(!coder[fn]) throw new Error(`!coder[${fn}] : ${coder.constructor.name}`)
	const fun = (arg===undefined) ? coder[fn].bind(coder) : coder[fn].bind(coder, arg);
	
	const start = performance.now();
	for(let i=trials;i!==0;i--){
		coder.pos=0;
		fun();
	} 
	return Math.round(performance.now() - start);	
}
function calcPerfomance(coder, affix){
	return {
		read  : _calcPerfomance(coder, 'read'+affix),
		write : _calcPerfomance(coder, 'write'+affix, 1)
	}
}

['DoubleLE', 'FloatLE', 'UInt8', 'UInt16LE', 'UInt32BE'].forEach(type=>{
	console.log(type);
	console.table(Object.fromEntries(coders.map(coder=>[
		coder.constructor.name, 
		calcPerfomance(coder, (coder===buffer ? '' : 'Next')+type)]
	)));	
})