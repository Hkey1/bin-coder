module.exports = [
	'Int8',    'UInt8',
	'Int16',   'UInt16',   
	'Int32',   'UInt32',
	'Float32', 'Float64',
	'BigInt64','BigUInt64'
].map(type=>[ type, 
	global[type.replaceAll('UInt', 'Uint')+'Array'].prototype.BYTES_PER_ELEMENT
]);