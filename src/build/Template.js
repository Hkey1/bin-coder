/*warning*/
const assert        = require('node:assert');
const AbstractCoder = require('../AbstractCoder.js');

/*constants*/

class ClassName extends AbstractCoder {
	/*methods*/
};

const proto = ClassName.prototype;
['readNext', 'writeNext', 'bytes'].forEach(oper=>{
	['LE', 'BE'].forEach(endian=>{
		proto[oper+'Float'+endian]  = proto[oper+'Float32'+endian];
		proto[oper+'Double'+endian] = proto[oper+'Float64'+endian];		
	})	
})

/*after*/

module.exports = ClassName;