const assert = require('node:assert');
const Queue  = require('./Queue.js');

module.exports = class DicCoder{
	maxLen       = 0;
	length       = 0;
	_map         = new Map();
	_arr         = [];
	_isInit      = [];
	_queue       = null; //Queue;
	isEncoder    = undefined; //true, false, undefined
	firstNotInit = Infinity; //[]
	lastNotInit  = 0; //[]
	constructor(maxLen=256, isEncoder=undefined, initValues=[]){
		this._queue    = isEncoder!==false ? new Queue(maxLen) : undefined;
		this.maxLen    = maxLen;
		this.isEncoder = isEncoder;
		if(initValues!==undefined){
			if(!Array.isArray(initValues)) throw new Error(`!Array.isArray(initValues=${initValues})`);
			const iLen = initValues.length;
			if(iLen){
				if(iLen > maxLen) throw new Error(`initValues.length > maxLen : ${iLen} > ${maxLen}`);
				for(let index=iLen-1; index!==-1; index--){
					const val = initValues[index];
					if(this._map.has(val)) throw new Error(`Duplicate init values: initValues[${this._map.get(val)}]=initValues[${index}]=${val}`);
					this._arr[index] = val;
					this._map.set(val, index);	
					if(isEncoder!==false){
						this._queue.push(index);
					}
					this._isInit[index] = true;
				}
				this.length     = iLen;		
				this.initValues = initValues;
			}
		}
	}
	has(val){
		return this._map.has(val);
	}
	get(val){
		return this._map.get(val);
	}
	remember(val){
		this.encode(val);
	}
	encode(val){
		assert(this.isEncoder!==false)
		let index = this._map.get(val);
		if(index!==undefined){
			this._queue.reset(index);			
			return index;
		} else if(this.length===this.maxLen){
			index = this._queue.resetFirst();
			this._map.delete(this._arr[index]);
		} else {
			index = this.length;
			this.length++;			
			this._queue.push(index);			
		}
		
		this._arr[index] = val;
		this._map.set(val, index);			

		this.firstNotInit = Math.min(this.firstNotInit, index); 
		this.lastNotInit  = Math.max(this.lastNotInit, index); 
		
		return index;

	}
	decode(index){
		assert(this.isEncoder!==true)
		if(index<0 || !Number.isInteger(index)) throw new Error(`index=${index}`);
		if(index >= this.maxLen ) throw new Error(`index>=this.maxLen : ${index}>=${this.maxLen}`)
		if(index >= this.length ) throw new Error(`index>=this.length : ${index}>=${this.length}`)
		return this._arr[index];
	}
	set(index, value){
		assert(this.isEncoder!==true)
		if(index<0 || !Number.isInteger(index)) throw new Error(`index=${index}`);
		if(index >= this.maxLen) throw new Error(`index>=this.maxLen : ${index}>=${this.maxLen}`)
		this._arr[index] = value;
		if(index >= this.length){
			this.length = index+1;
		}
	}
};