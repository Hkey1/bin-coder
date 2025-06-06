const fs = require('node:fs').promises;

const fileNames = ['basic', 'microUInt', 'uIntX', 'uDoubleH'];

function trimEnters(str){
	return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}


['SafeCoder', 'FastCoder'].forEach(async className=>{
	let content = ((await fs.readFile('./Template.js', 'utf8'))
		.replaceAll('ClassName', className)
		.replaceAll('/*warning*/', `/*
			!!!Warning!!!
			This is autogenerated code! \n*/
		`)
	);
	const params = {
		methods   : '',
		constants : '',
		after     : '',
	};
	fileNames.forEach(fileName=>{
		const cParams = require(`./${fileName}.js`)(className==='SafeCoder');
		Object.keys(params).forEach(key=>{
			const val = cParams[key];
			if(val){
				params[key] += (''
					+'\n' 
					+ (key==='methods' ? '\t\t' : '') +'//' + fileName+'.js'
					+'\n' 
					+trimEnters(val) //trim enters
					+'\n' 
				) 
			}
		})
	})
	Object.entries(params).forEach(([key, val])=>{
		content = content.replace(`/*${key}*/`, '\n'+trimEnters(val))
	})

	const fn = `../builded/${className}.js`;
	if(content !== await fs.readFile(fn, 'utf8')){ 
		await fs.writeFile(fn, content, 'utf8');	
	}
	//require(fn); //syntax check
});