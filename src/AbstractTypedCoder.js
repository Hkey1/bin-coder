const assert = require('node:assert');

const typeByName = {
	Int8Array,     Uint8Array, 
	Int16Array,    Uint16Array, 
	Int32Array,    Uint32Array, 
	BigInt64Array, BigUint64Array,
	Float32Array,  Float64Array,
}
const allTypes      = Object.keys(typeByName);
const typeByLowName = Object.fromEntries(Object.entries(typeByName).map(([name,type])=>[name.toLowerCase(),type])) 
const maxInt32      = 2**31 - 1;

module.exports = class AbstractTypedCoder {
	static typeByName = typeByName;
	pos  = 0;
	aBuf = null; // ArrayBuffer / SharedArrayBuffer
	get length(){return this.aBuf.length}
	constructor(aBuf, pos=0, types=allTypes){
		if(this.constructor.name==='AbstractTypedCoder') throw new Error('AbstractTypedCoder is Abstract Class')
		if(Number.isInteger(aBuf) && aBuf>=0){
			aBuf = new ArrayBuffer(aBuf);
		} else if(!(aBuf instanceof ArrayBuffer || buf instanceof SharedArrayBuffer)) throw new Error(`aBuf=${buf} must be integer or ArrayBuffer or SharedArrayBuffer`);
		if(aBuf.length > maxInt32) throw new Error(`aBuf.length=${aBuf.length} > maxInt32=${maxInt32} (~2GB)`); // после этого числа операция >> глючит
		
		types.forEach((type,i)=>{
			if(typeof(type)==='string'){
				const type0 = type;
				type = type.toLowerCase();
				type = type.endsWith('array') ? type : type+'array';
				if(     type==='doublearray')           type = Float64Array;
				else if(type==='floatarray')            type = Float32Array;
				else typeByLowName.hasOwnProperty(type) type = typeByLowName[type];
				else throw new Error(`types[${i}]="${type0}" not found`);
			} else if(!(type.prototype instanceof TypedArray)){
				throw new Error(`Bad types[${i}]=${type} Expecting String or TypedArray`)
			}
			this[type.constructor.name] = new type(aBuf);
		})
	}	
};
//BYTES_PER_ELEMENT 
