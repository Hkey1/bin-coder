const constants = `
	const ud_hexToChar = [
		'0',   //0
		'1',   //1
		'2',   //2
		'3',   //3
		'4',   //4
		'5',   //5
		'6',   //6
		'7',   //7
		'8',   //8
		'9',   //9
		'.',   //10
		'e-',  //11
		'e+',  //12
		'00',  //13
		'.0',  //14
		'000', //15
	]
	const ud_cArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //speedUp
	const ud_map = new Map([ //['0', 0], //speedUp
		['1', 1], ['2', 2], ['3', 3],
		['4', 4], ['5', 5], ['6', 6], 
		['7', 7], ['8', 8], ['9', 9]
	]); 
	ud_get = ud_map.get.bind(ud_map); //speedUp
`;
module.exports = function basic(safe=false){	
	const checks0  = safe ? `
				if(this.bitPos!==0) throw new Error('UDoubleH: this.bitPos='+this.bitPos);
				if(this.pos+2>this.buf.length) throw new Error('UDoubleH: this.pos+2='+(this.pos+2)+'>this.buf.length='+this.buf.length);
					` : '';
	const checkVal = safe ? `
					if(typeof(val)!=='number') throw new Error('UDoubleH: val='+val+' typeof(val)='+typeof(val));` : '';	
	return {methods: `
			writeNextUDoubleH(val){${checks0}${checkVal}
				if(isNaN(val)) {//to 2 dots: '..'
					this.writeNextUInt1(1);//минус		
					this.writeNextUInt3(0);//длина 0+2 = 2
					this.writeNextUInt4(10);//.
					this.writeNextUInt4(10);//.
					this.bitPos = 0;
					this.pos++;
					//this.writeNextUInt4(1);
					return;
				};
				if(val===-0) val = +0; 
				${safe ? "if(val<0) throw new Error('UFloat must be >=0 Given:'+val);": ""}
				if(!isFinite(val)) {//to 3 dots: '...'
					this.writeNextUInt1(1);//минус		
					this.writeNextUInt3(1);//длина 1+2 = 3
					this.writeNextUInt4(10);//.
					this.writeNextUInt4(10);//.
					this.writeNextUInt4(10);//.
					return;
				}		
					
				let str = val+'';
				if(str==='.0'){
					str ='0.';
				} else if(str.length===1){
					str += '.';
				} else if(str.startsWith('0.') && str.length!==2){
					str = str.substring(1)
				}
					
				let   cLen = 0
				const sLen = str.length;
				for(let i=0; i<sLen; i++){
					const cur = str[i];
					if(cur==='0'){
						if(str[i+1]!=='0'){
							ud_cArr[cLen++] = 0; 
						} else if(str[i+2]!=='0'){
							ud_cArr[cLen++] = 13; 
							i++;
						} else {
							ud_cArr[cLen++] = 15; 
							i+= 2;
						}
					} else if(cur==='e'){
						if(str[i+1]==='-'){
							ud_cArr[cLen++] = 11;
						} else if(str[i+1]==='+'){
							ud_cArr[cLen++] = 12;
						} else throw new Error('Bad symbol after e "'+str[i+1]+'" in "'+str+'". Expecting - or +');
						i++;
					} else if(cur==='.'){
						if(str[i+1]!=='0'){
							ud_cArr[cLen++] = 10; 
						} else {
							ud_cArr[cLen++] = 14; 
							i++;
						}
					} else {
						ud_cArr[cLen++] = ud_get(cur);
					}
				}

				if(cLen < 2 || cLen > 9){
					return this.writeNextDoubleBE(val);
				}
				this.writeNextUInt1(1);//минус		
				this.writeNextUInt3(cLen-2);
				for(let i=0; i<cLen; i++){
					this.writeNextUInt4(ud_cArr[i]);
				}
				if(this.bitPos!==0){ //this.writeNextUInt4(0)
					this.bitPos = 0;
					this.pos++;
				}
			}
			readNextUDoubleH(){${checks0}
				const sign  = this.readNextUInt1();
				if(sign===0){
					this.bitPos = 0;
					return this.readNextDoubleBE();
				}
				const len = 2 + this.readNextUInt3();
				let str = '';
				for(let i=0;i<len;i++){
					str+= ud_hexToChar[this.readNextUInt4()];			
				}
				if(this.bitPos!==0){
					this.bitPos=0;
					this.pos++
				}
				if(str==='..'){
					return NaN;
				} else if(str==='...'){
					return Infinity;
				} else {
					return parseFloat(str);							
				}
			}
	`, constants};
}