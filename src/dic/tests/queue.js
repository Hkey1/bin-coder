const assert = require('node:assert');
const Queue  = require('../Queue.js');

const len     = 10;
const steps   = 101;
const trials  = 10050;

function randomIntFromTo(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log('queue tests:');
for(let t=0; t<trials; t++){
	let arr   = [];
	let queue = new Queue(len);
	function check(){
		queue.byIndex.forEach((item,j)=>{
			assert.equal(item.index,j);
			if(!item.inHeap){
				assert(!item.prev);
				assert(!item.next);
				assert(queue.first!==item);
				assert(queue.last!==item);
			}
		})
		let cur  = queue.first;
		let prev = null
		while(cur !== null){
			if(!cur)	console.log(cur);
			assert.equal(prev, cur.prev)
			prev = cur;
			cur  = cur.next;
		}
		cur      = queue.last;
		let next = null;
		let n    = 0;
		while(cur !== null){
			if(!cur)	console.log(cur);
			assert.equal(cur.next, next)
			n++;
			next = cur;
			cur  = cur.prev;
		}
		
		const q = queue.toArray();
		assert.equal(q.length, arr.length);
		for(let j=0; j<q.length; j++){
			assert.equal(q[j], arr[j]);
		}
	}
	for(let j=0; j<steps; j++){
		if(Math.random()>0.7 && arr.length!==0){
			const index = arr.shift();
			arr.push(index);
			assert.equal(queue.resetFirst(), index);
		}
		const index = randomIntFromTo(0, len-1);
		if(Math.random()>0.3 || arr.length===0){
			if(arr.indexOf(index)!==-1){
				arr.splice(arr.indexOf(index), 1);
				if(Math.random()>0.5){
					queue.reset(index);
					arr.push(index);
					check();
					continue;
				}
				queue.remove(index);
				check();
			}
			queue.push(index);
			arr.push(index);
			check();
		} else {
			assert.equal(queue.shift(), arr.shift());
			check();
		}
	}
}
console.log('queue tests passed');
