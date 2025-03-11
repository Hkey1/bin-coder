const assert = require('node:assert');

module.exports = class DicCoder255 extends require('./DicCoderX.js'){
	constructor(coder, dataType, isEncoder=undefined, initValues=[]){
		super(255, coder, dataType, isEncoder, initValues);
	}
	bytes(val){
		return this.get(val) === undefined ? 2 + this._valueBytes(val) : 1;
	}
	writeNext(val){
		assert(this.isEncoder!==false);

		const index = this.get(val);
		if(index === undefined){
			this.coder.writeNextUInt8(255);
			this.coder.writeNextUInt8(this.encode(val));
			this._writeNextValue(val);
		} else {
			this.coder.writeNextUInt8(index);
		}
	}
	readNext(){
		assert(this.isEncoder!==true);

		let index = this.coder.readNextUInt8();
		if(index===255){
			index       = this.coder.readNextUInt8();
			const value = this._readNextValue();
			this.set(index, value)
			return value;
		} else {
			return this.decode(index);
		}
	}
};