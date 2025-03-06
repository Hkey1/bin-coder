# bin-coder
Node.js package. Analog of Node.js Buffer.

## Differences from Node.js Buffer
* Speed is slightly higher
* More simply to use due to Auto-calculation of read and write position
* Has more data types
* Has arbitrary length data types that can significantly reduce the size of the data

# Install
`npm i hkey-bin-coder`

## Safe and Fast
Two versions:
* SafeCoder -- with arguments checks
* FastCoder -- without arguments checks

```js
	const {SafeCoder, FastCoder} = require('hkey-bin-coder');
```
## constructor
There are several options for the constructor:

### Number of Bytes to alloc
```js
	const coder = new SafeCoder(100)
```

### Node.js Buffer
```js
	const buffer = Buffer.alloc(100);
	const coder  = new SafeCoder(buffer)
```

### JS ArrayBuffer
```js
	const buffer = Buffer.alloc(100);
	const coder  = new SafeCoder(buffer.buffer)
```

## pos
The object has a property pos -- the current position for reading and writing. It shifts during reading and writing.

```js
	const {SafeCoder} = require('bin-coder');
	const coder = new SafeCoder(100)
	
	coder.writeNextDoubleLE(1);
	coder.writeNextDoubleLE(2);
	
	coder.pos = 0;
	
	console.log(coder.readNextDoubleLE()); //1
	console.log(coder.readNextDoubleLE()); //2	
```

## Data Types
It suport many data types

### As in Node.js Buffer
Supports all data types that Node.js Buffer. 
Speed is slightly higher than in Buffer. We are using DataView.
Use readNext${Type} and writeNext${Type}. Not read${Type} and write${Type} 

* UInt8
* UInt16(LE/BE)
* UInt32(LE/BE)
* Int8
* Int16(LE/BE)
* Int32(LE/BE)
* BigInt64(LE/BE)
* BigUInt64(LE/BE)
* Float(LE/BE)
* Double(LE/BE)

### Ints with non-standarts length
Supports ints with length = 3,5,6 bytes;

* UInt24(LE/BE)
* UInt40(LE/BE)
* UInt48(LE/BE)
* Int24(LE/BE)
* Int40(LE/BE)
* Int48(LE/BE)

### Micro UInts
It also supports encoding several unsigned integers in 1 byte.

* UInt1
* UInt2
* UInt3
* UInt4
* UInt5
* UInt6
* UInt7

```js
	coder.writeNextUInt4(1);
	coder.writeNextUInt4(2);
```

### UIntX(LE/BE)
An unsigned integer with auto length. 
This allows you to write almost any unsigned integers into a minimum number of bytes.

| value | bytes |
|----------|----------|
| 0 - 239          							| 1 |
| 240 - 2543       							| 2 |
| 2544 - 68079                    			| 3 |
| 68,080 - 16,845,295             			| 4 |
| 16,845,296 - 4,311,812,591       			| 5 |
| 4,311,812,592 - 1,103,823,440,367     	| 6 |
| 1,103,823,440,368 - 281,474,976,710,656 	| 7 |
  
### UFloatH
It allows to reduce the number of bytes for recording unsigned double in several times.
Without loss of accuracy. Works well with decimals. Suports NaN and +Infinity.

2-5 or 8 bytes

#### Algo
* converts a number to a string
* encodes characters into 4 bits (hex)
* some combinations of symbols are also encoded in 4 bits (".0", "00", "e+", "e-", "000")

### StringX(LE/BE), BufferX(LE/BE), JsonX(LE/BE) 
Allows you to encode any data. For Length encoding used UIntX(LE/BE)