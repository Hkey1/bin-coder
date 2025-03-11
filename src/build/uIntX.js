//255 = 1+8:BigInt64 
//254 = 1+6:UInt(6)   -- 
//253 = 1+5:UInt(5) | 
//252 = 1+4:UInt(4) |  UInt(i-248) 
//251 = 1+3:UInt(3) |
//250 = 1+2:UInt(2)   --
//... = 1+1:UInt8+240+255*(i-240)
//243 = 1+1:UInt8+240+255*3
//242 = 1+1:UInt8+240+255*2
//241 = 1+1:UInt8+240+255
//240 = 1+1:UInt8+240
//239 = 1:i

const constants = `
	const MaxUIntXB0 = 240;
	const MaxUIntXB1 = MaxUIntXB0 + 256*9;
	const MaxUIntXB2 = MaxUIntXB1 + Math.pow(2, 2*8);
	const MaxUIntXB3 = MaxUIntXB2 + Math.pow(2, 3*8);
	const MaxUIntXB4 = MaxUIntXB3 + Math.pow(2, 4*8);
	const MaxUIntXB5 = MaxUIntXB4 + Math.pow(2, 5*8);
	const MaxUIntXB6 = 0          + Math.pow(2, 6*8); //чтобы не было переполнения
	const MaxUIntXBM = [0, MaxUIntXB0, MaxUIntXB1, MaxUIntXB2, MaxUIntXB3, MaxUIntXB4, MaxUIntXB5, MaxUIntXB6];
`;
module.exports = function microUInt(safe=false){
	const methods = [];
	['LE', 'BE'].forEach(EN=>{
		const posCheck = safe ? `
				if(this.pos+1>this.buf.length) throw new Error('UIntX: this.pos+1 ='+(this.pos+1)+' >=this.buf.length='+this.buf.length);
				if(this.bitPos!==0) throw new Error('UIntX: this.bitPos='+this.bitPos);` : '';
		methods.push(`
			readNextUIntX${EN}(){ ${posCheck}
				let i = this.readNextUInt8();
				if(i<MaxUIntXB0){
					return i;
				} else if(i===255){
					return this.readNextBigUInt64${EN}()
				} else if(i>=250){
					if(i===254){
						return this.readNextUInt${EN}(6);
					} else {
						const b = i-248;
						return this.readNextUInt${EN}(b) + MaxUIntXBM[b];
					}
				} else {
					return this.readNextUInt8() + MaxUIntXB0 + ((i-MaxUIntXB0)<<8); //*256
				}
			}
			writeNextUIntX${EN}(val){${posCheck}
				${safe ? `if(val<0 || (!Number.isInteger(val) && typeof(val)!=='bigint')) {
					throw new Error('UIntX: val='+val+' typeof='+typeof(val)+'. Expecting not negative Int');
				}`: ''}
				if(val<MaxUIntXB0){
					this.writeNextUInt8(val);
					return 1;
				} else if(val<MaxUIntXB1){
					const n = val - MaxUIntXB0;
					this.writeNextUInt8(MaxUIntXB0 + (n>>8));
					this.writeNextUInt8(n & 255);
					return 2;
				} else if(val<MaxUIntXB2){
					this.writeNextUInt8(250);
					this.writeNextUInt${EN}(val-MaxUIntXB1, 2);
					return 3;
				} else if(val<MaxUIntXB3){
					this.writeNextUInt8(251);
					this.writeNextUInt${EN}(val-MaxUIntXB2, 3);
					return 4;
				} else if(val<MaxUIntXB4){
					this.writeNextUInt8(252);
					this.writeNextUInt${EN}(val-MaxUIntXB3, 4);
					return 5;
				} else if(val<MaxUIntXB5){
					this.writeNextUInt8(253);
					this.writeNextUInt${EN}(val-MaxUIntXB4, 5);
					return 6;
				} else if(val<MaxUIntXB6){
					this.writeNextUInt8(254);
					this.writeNextUInt${EN}(val, 6);
					return 7;
				} else {
					this.writeNextUInt8(255);
					this.writeNextBigUInt64${EN}(val);
					return 9;
				}
			}
			bytesUIntX${EN}(val){${posCheck}
				${safe ? `if(val<0 || (!Number.isInteger(val) && typeof(val)!=='bigint')) {
					throw new Error('UIntX: val='+val+' typeof='+typeof(val)+'. Expecting not negative Int');
				}`: ''}
				if(val<MaxUIntXB0){
					return 1;
				} else if(val<MaxUIntXB1){
					return 2;
				} else if(val<MaxUIntXB2){
					return 3;
				} else if(val<MaxUIntXB3){
					return 4;
				} else if(val<MaxUIntXB4){
					return 5;
				} else if(val<MaxUIntXB5){
					return 6;
				} else if(val<MaxUIntXB6){
					return 7;
				} else {
					return 9;
				}
			}`)			
	});
	return {methods: methods.join(''), constants};	
}