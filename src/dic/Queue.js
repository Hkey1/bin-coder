const assert = require('node:assert');

class QueueItem{
	index  = 0
	next   = null
	prev   = null	
	inHeap = false
	constructor(index){
		this.index = index
	}
};

module.exports = class Queue{
	byIndex = [];
	first   = null;
	last    = null;
	length  = 0; 
	maxLen  = 0;
	constructor(maxLen){
		this.maxLen = maxLen;
		for(let i=0; i<maxLen; i++){
			this.byIndex.push(new QueueItem(i));
		}
	}
	toArray(){
		const res = [];
		let cur   = this.first;
		while(cur!==null){
			res.push(cur.index)
			cur = cur.next;
		}
		return res;
	}
	_removeItem(item){
		assert(item.inHeap)
		item.inHeap=false
		
		if(this.first===item){
			this.first = item.next;
		}
		if(this.last===item){
			this.last = item.prev;
		}
		if(item.next){
			assert.equal(item.next.prev, item);
			item.next.prev = item.prev; 
		}
		if(item.prev){
			assert.equal(item.prev.next, item);
			item.prev.next = item.next; 
		}
		item.next = null;
		item.prev = null;
		this.length--;
	}
	push(index){
		const cur = this.byIndex[index];
		cur.inHeap = true;
		
		if(this.last){
			this.last.next = cur;
			cur.prev       = this.last;
		} else {
			cur.prev       = null;
		}
		cur.next  = null 
		this.last = cur;
		
		if(cur.prev){
			cur.prev.next = cur;
		}
		
		if(!this.first){
			this.first = cur;
		}
		this.length++			
	}
	shift(){
		const index = this.first.index;
		this._removeItem(this.first);
		return index;
	}
	remove(index){
		this._removeItem(this.byIndex[index]);
	}
	reset(index){
		const cur = this.byIndex[index];
		if(this.last===cur){
			return;
		}
		if(this.first===cur){
			this.first = cur.next;
		} else {
			cur.prev.next = cur.next;
		}

		cur.next.prev = cur.prev;
		cur.next      = null;
		cur.prev      = this.last;

		if(cur.prev){
			cur.prev.next = cur;
		}
		this.last     = cur;
	}
	resetFirst(){
		const cur = this.first;
		if(this.last===cur){
			return cur.index;
		}
		this.first    = cur.next;
		cur.next.prev = cur.prev;
		cur.next      = null;
		cur.prev      = this.last;

		if(cur.prev){
			cur.prev.next = cur;
		}
		this.last         = cur;
		return cur.index;
	}
};
