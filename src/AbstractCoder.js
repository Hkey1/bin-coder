const assert = require('node:assert');
const types  = require('./types.js');

class AbstractCoder {
	static types = types;

	pos          = 0
	buf          = null //Buffer
	bitPos       = 0
	get length(){return this.buf.length}

	constructor(buf, pos=0){
		if(this.constructor.name==='AbstractBuffer') throw new Error('AbstractBuffer is Abstract Class')
		if(!(buf instanceof Buffer)){
			if(Number.isInteger(buf)){
				buf = Buffer.alloc(buf);
			} else if(buf instanceof ArrayBuffer || buf instanceof SharedArrayBuffer){
				buf = Buffer.from(buf);
			} else throw new Error(`buf=${buf}`)		
		}

		if(!Number.isInteger(pos) || pos<0)	throw new Error(`pos=${pos}`)
		assert(pos<=buf.length);
		
		this.buf      = buf;
		this.pos      = pos;
		this.dataView = new DataView(this.buf.buffer);
		
		types.forEach(([type, bytes])=>{
			const esmType = type.replace('UInt', 'Uint');
			if(bytes===1){
				this[`_typed${type}`] = new global[esmType+'Array'](this.buf.buffer);
			} else { //speedUp
				this['get'+type] = this.dataView['get'+esmType].bind(this.dataView);
				this['set'+type] = this.dataView['set'+esmType].bind(this.dataView);
			}
		})
	}	
	skip(bytes){
		if(this.bitPos!==0) throw new Error('this.bitPos='+this.bitPos)
		if(!Number.isInteger(bytes) || bytes<0) throw new Error('bytes='+bytes+' typeof='+typeof(bytes));
		if(this.pos+bytes > this.buf.length)    throw new Error(`this.pos+bytes=${this.pos}+${bytes}=${this.pos+bytes}>this.buf.length=${this.buf.length} `);
		this.pos += bytes;
	}
	skipBits(bits){
		if(!Number.isInteger(bits) || bits<0) throw new Error('bits='+bits+' typeof='+typeof(bits));
		if(this.bitPos+bits > 8)              throw new Error(`this.bitPos+bits=${this.bitPos}+${bits}=${this.bitPos+bits}>8`);
		if(this.pos >= this.buf.length)       throw new Error(`this.pos = ${this.pos} >= ${this.buf.length}`);
		
		this.bitPos += bits;
		if(this.bitPos===8){
			this.bitPos = 0;
			this.pos   += 0;
		}
	}

//Buffer	
	readNextBuffer(len){
		if(this.bitPos!==0) 				throw new Error(`this.bitPos=${this.bitPos}`);
		if(!Number.isInteger(len)||len<0)	throw new Error(`len=${len}`)
		const end = this.pos+len;
		const res = this.buf.subarray(this.pos, end);
		this.pos  = end;
		return res;
	}
	readNextBufferXLE(){ return this.readNextBuffer(this.readNextUIntXLE()); }
	readNextBufferXBE(){ return this.readNextBuffer(this.readNextUIntXBE());}
	
	writeNextBuffer(buf, sourceStart=0, sourceEnd=buf.length){
		if(this.bitPos!==0) throw new Error(`this.bitPos=${this.bitPos}`);
		buf.copy(this.buf, this.pos, sourceStart, sourceEnd);
		const len = sourceEnd-sourceStart;
		this.pos += len;
		return len;
	}
	writeNextBufferXLE(buf, sourceStart=0, sourceEnd=buf.length){
		this.writeNextUIntXLE(sourceEnd-sourceStart);
		return this.writeNextBuffer(buf, sourceStart, sourceEnd);
	}
	writeNextBufferXBE(buf, sourceStart=0, sourceEnd=buf.length){
		this.writeNextUIntXBE(sourceEnd-sourceStart);
		return this.writeNextBuffer(buf, sourceStart, sourceEnd);
	}	
	bytesBuffer(buf, sourceStart=0, sourceEnd=buf.length){
		//console.log('bytesBuffer', sourceStart, sourceEnd);
		return sourceEnd-sourceStart;
	}
	bytesBufferXLE(buf, sourceStart=0, sourceEnd=buf.length){
		const len = sourceEnd-sourceStart; 
		return this.bytesUIntXLE(len) + len;
	}
	bytesBufferXBE(buf, sourceStart=0, sourceEnd=buf.length){
		const len = sourceEnd-sourceStart; 
		return this.bytesUIntXBE(len) + len;
	}
	
//String	
	readNextString(len, encoding='utf8'){		return this.readNextBuffer(len).toString(encoding);}
	readNextStringXLE(encoding='utf8'){ 		return this.readNextBufferXLE().toString(encoding);}
	readNextStringXBE(encoding='utf8'){ 		return this.readNextBufferXBE().toString(encoding);}
	writeNextString(str, encoding='utf8'){		return this.writeNextBuffer(Buffer.from(str, encoding));}
	writeNextStringXLE(str, encoding='utf8'){	return this.writeNextBufferXLE(Buffer.from(str, encoding));}	
	writeNextStringXBE(str, encoding='utf8'){	return this.writeNextBufferXBE(Buffer.from(str, encoding));}
	bytesString(str, encoding='utf8'){		return this.bytesBuffer(Buffer.from(str, encoding));}
	bytesStringXLE(str, encoding='utf8'){	return this.bytesBufferXLE(Buffer.from(str, encoding));}	
	bytesStringXBE(str, encoding='utf8'){	return this.bytesBufferXBE(Buffer.from(str, encoding));}


//JSON	
	readNextJson(len, encoding='utf8'){	return JSON.parse(this.readNextString(len, encoding))}
	readNextJsonXLE(encoding='utf8'){	return JSON.parse(this.readNextStringXLE(encoding))}
	readNextJsonXBE(encoding='utf8'){	return JSON.parse(this.readNextStringXBE(encoding))}
	writeNextJson(data,    encoding='utf8'){return this.writeNextString(JSON.stringify(data), encoding)}
	writeNextJsonXLE(data, encoding='utf8'){return this.writeNextStringXLE(JSON.stringify(data), encoding)}
	writeNextJsonXBE(data, encoding='utf8'){return this.writeNextStringXBE(JSON.stringify(data), encoding)}	
	bytesJson(data,    encoding='utf8'){return this.bytesString(JSON.stringify(data), encoding)}
	bytesJsonXLE(data, encoding='utf8'){return this.bytesStringXLE(JSON.stringify(data), encoding)}
	bytesJsonXBE(data, encoding='utf8'){return this.bytesStringXBE(JSON.stringify(data), encoding)}	
	
};

module.exports = AbstractCoder;