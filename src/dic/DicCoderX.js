const assert        = require('node:assert');
const AbstractCoder = require('../AbstractCoder.js');

module.exports = class DicCoderX extends require('./DicCoder.js'){
	coder    = null; //AbstractCoder
	dataType = '';
	constructor(maxLen, coder, dataType, isEncoder=undefined, initValues=[]){
		assert(coder instanceof AbstractCoder);
		assert.equal(typeof dataType, 'string');
		assert(dataType.length);
		if(!coder['readNext'+dataType]) throw new Error(`!coder[readNext${dataType}]`);
		if(!coder['writeNext'+dataType]) throw new Error(`!coder[writeNext${dataType}]`);

		super(maxLen, isEncoder, initValues); if(this.constructor.name==='DicCoderX') throw new Error('DicCoderX is abstract class');
		
		this.coder    = coder; //AbstractCoder
		this.dataType = dataType;
		
		this._readNextValue  = coder['readNext'+dataType].bind(coder);
		this._writeNextValue = coder['writeNext'+dataType].bind(coder);
	}
	saveNext(){
		assert(this.isEncoder!==false);
		let length, offset = 0;
		if(this.initValues){
			if(isFinite(this.firstNotInit)){
				length = this.lastNotInit - this.firstNotInit + 1;
				offset = this.firstNotInit;
			} else {
				length = 0;
				offset = 0;
			}
			this.coder.writeNextUInt8(offset);
		} else {
			length = this.length;
		}
		this.coder.writeNextUInt8(length);
		for(let i=0; i<length; i++){
			this._writeNextValue(this._arr[i+offset]); 
		}
	}
	loadNext(){
		assert(this.isEncoder!==true);
		let offset = 0;
		if(this.initValues){
			offset = this.coder.readNextUInt8()
		}
		const length = this.coder.readNextUInt8()
		for(let i=0; i<length; i++){
			this.set(i+offset, this._readNextValue()); 
		}
	}
};