const assert = require('node:assert');

module.exports = class DicCoder128 extends require('./DicCoderX.js'){
	constructor(coder, dataType, isEncoder=undefined, initValues=[]){
		super(128, coder, dataType, isEncoder, initValues);
	}
	writeNext(val){
		assert(this.isEncoder!==false);
		const vPos = this.coder.pos;

		const index = this.get(val);
		if(index === undefined){
			this.coder.writeNextUInt8(this.encode(val)+128);
			this._writeNextValue(val);
		} else {
			this.coder.writeNextUInt8(index);
		}
	}
	readNext(){
		assert(this.isEncoder!==true);
		const vPos = this.coder.pos;

		let index  = this.coder.readNextUInt8();
		
		if(index>127){
			const val = this._readNextValue();
			this.set(index - 128, val);
			return val;
		} else {
			return this.decode(index);
		}
	}
};