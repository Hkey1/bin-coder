const types  = require('../types');

const constants = `
	const maxUIntByBytes = [null, ${[1,2,3,4,5,6].map(bytes=>Math.pow(2, bytes*8)-1).join(', ')}]
	const maxIntByBytes  = [null, ${[1,2,3,4,5,6].map(bytes=>Math.pow(2, bytes*8-1)-1).join(', ')}]
	const minIntByBytes  = [null, ${[1,2,3,4,5,6].map(bytes=>-Math.pow(2, bytes*8-1)-1).join(', ')}]
`

function rangeCheck(type, from, to){return `
					if(val<${from} || val>${to}) throw new Error('${type}: must be in range [${from}, ${to}]. Given: '+val);`
}	

function bitsRangeCheck(type, bits, signed=false){
	return (signed 
		? rangeCheck(type, -1*Math.pow(2, 8*bytes -1), Math.pow(2, 8*bytes -1)-1)
		: rangeCheck(type, 0,                          Math.pow(2, 8*bytes)-1)
	);
}
function dBytesRangeCheck(type, signed=false){
	const min = signed ? 'minIntByBytes[bytes]' : '0';
	const max = `max${signed?'':'U'}IntByBytes[bytes]`;
	return `
					if(val<${min} || val>${max}) throw new Error('${type}: val must be in range ['+${min}+','+${max}+']. Given: '+val);`	
}
 
const sIntTypes = [];
['U',''].forEach(affix=>{
	sIntTypes.push([`${affix}Int`, 'bytes']);
	[3,5,6].forEach(bytes=>{
		const type    = `${affix}Int${8*bytes}`;
		const type0   = `${affix}Int`;
		sIntTypes.push([type, bytes, type0]);
	})
});
//console.log(sIntTypes);
	
module.exports = function basic(safe=false){	
	const methods = [];
	[...types, ...sIntTypes].forEach(([type, bytes, type0])=>{
		const dyn = bytes==='bytes';
		const big = type==='BigInt64' || type==='BigUInt64';
		
		const bytesCheck = safe && dyn ? `
					if(!Number.isInteger(bytes) || bytes>6 || bytes<1) throw new Error('${type}: bytes must be Int in range [1,6]. Given: ${bytes}');`: '';
		const intCheck = safe ? `
					if(!Number.isInteger(val)) throw new Error('${type}: val='+val+' typeof='+typeof(val));`:''
		const toBig = big ? `
					if(typeof(val)!=='bigint'){ ${intCheck.trim()}						
						val = BigInt(val)
					}` : '';
		
		const checks0 = safe ? bytesCheck + `
					if(this.bitPos!==0) throw new Error('this.bitPos='+this.bitPos);
					if(this.pos + ${bytes} > this.buf.length) throw new Error('${type}:this.pos + ${bytes} = '+(this.pos+${bytes})+'> this.buf.length='+this.buf.length);`: '';		

		let wCheck = ''
		if(dyn){
			wCheck = intCheck + dBytesRangeCheck(type, !type.includes('UInt'));
		} else if(big){
			const min = type === 'BigInt64' ? -1n*(1n<<(64n - 1n)) - 0n : 0n;
			const max = type === 'BigInt64' ?  1n*(1n<<(64n - 1n)) - 1n 
											:  1n*(1n<<(64n - 0n)) - 1n;
			wCheck = rangeCheck(type, min+'n', max+'n');
		} else if(type.includes('Int')){
			wCheck = intCheck + (!type.includes('UInt') 
				? rangeCheck(type, -1*Math.pow(2, 8*bytes -1), Math.pow(2, 8*bytes -1)-1)
				: rangeCheck(type, 0,                          Math.pow(2, 8*bytes)-1)
			)
		} else if(type.includes('Float')){
			wCheck = `
					if(typeof(val)!=='number') throw new Error('${type}: val='+val+' typeof='+typeof(val));`
		} else throw new Error(`type=${type}`)
		wCheck = safe ? wCheck : ''

		if(bytes===1){
			methods.push(`	
			//${type}
				readNext${type}(){ ${checks0}
					return this._typed${type}[this.pos++];
				}
				writeNext${type}(val){ ${checks0} ${wCheck} 
					this._typed${type}[this.pos++] = val;
				}`
			);
		} else ['BE','LE'].forEach(endian=>{
			let get, set;
			if(type0 || dyn){
				get = `this.buf.read${type0||type}${endian}(this.pos, ${bytes})`       
				set = `this.buf.write${type0||type}${endian}(val, this.pos, ${bytes})`;
			} else {
				get = `this.get${type}(this.pos, ${endian==='LE'})`;
				set = `this.set${type}(this.pos, val, ${endian==='LE'})`;
			}

			methods.push(`	
			//${type}${endian}
				readNext${type}${endian}(${dyn ? 'bytes': ''}){ ${checks0}
					const res  = ${get};
					this.pos  += ${bytes};
					return res;
				}
				writeNext${type}${endian}(val${dyn ? ', bytes': ''}){ ${checks0}${toBig}${wCheck}						
					${set}
					this.pos  += ${bytes};
				}`
			);
		})
	});
	return {methods: methods.join('\n'), constants};
}

