module.exports = function microUInt(safe=false){
	const methods = []; 
	['bits',1,2,3,4,5,6,7].forEach(bits=>{
		const fixed = bits !== 'bits';
		const type  = fixed ? `UInt${bits}`     : 'MicroUInt';
		const mask  = fixed ? ((1 << bits) - 1) : '((1 << bits) - 1)';
		
		const checksBits = (safe && !fixed) ? `
					if(!Number.isInteger(bits) || bits<0 || bits>7)  throw new Error("${type}: bits must be in [1,7]. Given:"+bits);`:'';
		const checkEnd   = safe       ? `
					if(end>8) throw new Error("${type}: 8<end="+end)`:'';
		const wChecks    = safe       ? `
					if(!Number.isInteger(val) || val<0 || val>${mask}) throw new Error("${type}: val must be in [0,"+${mask}+"]. Given:"+val);`: '';
		const checkPos   = safe       ? `
					if(this.pos>=this.buf.length) throw new Error('${type}: this.pos='+this.pos+' >= this.buf.length='+this.buf.length+'')` : '';
		const def1       = safe       ? '' : '=1';
		
		methods.push(`
			//${type}
				readNext${type}(${fixed ? '' : 'bits'+def1}){ ${checksBits} ${checkPos}
					const end = this.bitPos + ${bits}; ${checkEnd}
					const res = (this._typedUInt8[this.pos] >> (8 - end)) & ${mask};
					if(end===8){
						this.pos++;
						this.bitPos = 0;
					} else {
						this.bitPos = end;
					}
					return res;
				}
				writeNext${type}(val${fixed ? '' : ', bits'+def1}){ ${checksBits} ${wChecks} ${checkPos}
					const end = this.bitPos + ${bits}; ${checkEnd}
					let x     = this._typedUInt8[this.pos];
					x &= ~(${mask} << (8 - end)); // Clear the relevant bits
					x |= (val & ${mask}) << (8 - end); // Set the new value
					this._typedUInt8[this.pos] = x;
					if(end===8){
						this.pos++;
						this.bitPos = 0;
					} else {
						this.bitPos = end;
					}
				}
				bytes${type}(val${fixed ? '' : ', bits'+def1}){ ${checksBits}
					const end = this.bitPos + ${bits}; 
					return (end===8) ? 1 : 0;
				}
				`
		);
	});
	return {methods: methods.join(''), constants:''};
}