const trials = 1e8;
const nVals  = 256;


//const table = [];
//for(let i=0; i<256; i++){
//	table.push({i, val: i>127 ? i-128 : i})
//}
//console.table(table);


const map = new Map();
for(let i=0; i< nVals; i++){
	map.set(Math.random(), i);
}

let start;

start = performance.now();
for(let i=trials;i!==0;i--){
	map.has(i)
} 
console.log('map.has', performance.now() - start);	


const map_has = map.has.bind(map); 
start = performance.now();
for(let i=trials;i!==0;i--){
	map_has(i)
} 
console.log('map_has', performance.now() - start);	

const obj = {map, map_has}


start = performance.now();
for(let i=trials;i!==0;i--){
	obj.map.has(i)
} 
console.log('obj.map.has', performance.now() - start);	

start = performance.now();
for(let i=trials;i!==0;i--){
	obj.map_has(i)
} 
console.log('obj.map_has', performance.now() - start);	
