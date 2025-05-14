module.exports = Object.fromEntries([
	'DicCoder', 'DicCoder128', 'DicCoder255', 'DicCoderX', 'Queue'	
].map(name=>[name,
	require(`./${name}.js`)
]));



