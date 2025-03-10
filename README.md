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
This allows you to write any unsigned integers up to 64 bits into a minimum number of bytes.

| from                | to                    		| bytes |
|---------------------|-----------------------------|-------|  
| 0 				  | 239          				| 1     |
| 240 				  | 2543       					| 2     |
| 2544 				  | 68079               		| 3     |
| 68,080 			  | 16,845,295            		| 4     |
| 16,845,296 		  | 4,311,812,591       		| 5     |
| 4,311,812,592 	  | 1,103,823,440,367     		| 6     |
| 1,103,823,440,368   | 281,474,976,710,655 		| 7     |
| 281,474,976,710,656 | 18,446,744,073,709,551,999	| 9     |
  
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

## Dictionaries
To encode repeating values, you can use dictionaries with 128 and 255 values.
* To encode a repeate of value, dictionaries require only 1 byte.
* To encode a new value, DicCoder128 or DicCoder255 require an additional 1 or 2 bytes

|               | new val   | repeate | 
|---------------|-----------|---------|  
| no dic 	    | n bytes   | n bytes |
| DicCoder127 	| 1+n bytes | 1 byte  |
| DicCoder255 	| 2+n bytes | 1 byte  |


### DicCoder127

```js
	const {SafeCoder, DicCoder127, DicCoder255} = require('hkey-bin-coder');

	const coder      = new SafeCoder(1000);
	const encoderDic = new DicCoder127(coder, 'DoubleLE', true);
	const decoderDic = new DicCoder127(coder, 'DoubleLE', false);
	
	encoderDic.writeNext(1.234); // 1+8 bytes
	encoderDic.writeNext(5.67)   // 1+8 bytes
	encoderDic.writeNext(1.234)  // 1   bytes
	encoderDic.writeNext(5.67)   // 1   bytes
	                             // 20  bytes vs 8*4=32 bytes
	
	coder.pos = 0;
	console.log(decoderDic.readNext()); // 1.234
	console.log(decoderDic.readNext()); // 5.67
	console.log(decoderDic.readNext()); // 1.234
	console.log(decoderDic.readNext()); // 5.67
```

### DicCoder255
```js
	...
	const encoderDic = new DicCoder255(coder, 'DoubleLE', true);
	const decoderDic = new DicCoder255(coder, 'DoubleLE', false);
	
	encoderDic.writeNext(1.234); // 2+8 bytes
	encoderDic.writeNext(5.67)   // 2+8 bytes
	encoderDic.writeNext(1.234)  // 1   bytes
	encoderDic.writeNext(5.67)   // 1   bytes
	                             // 22  bytes vs 8*4=32 bytes
	...
```

### initValues
You can set the initial values of the dictionary

```js
	...
	const encoderDic = new DicCoder255(coder, 'DoubleLE', true, [1.234]);
	
	encoderDic.writeNext(1.234); // 1   bytes (initValues)
	encoderDic.writeNext(5.67)   // 2+8 bytes
	encoderDic.writeNext(1.234)  // 1   bytes
	encoderDic.writeNext(5.67)   // 1   bytes
	                             // 13  bytes
	...
```
### save/load
You can save/load full state of of the dictionary.
Its reduce DicCoder127 or DicCoder255 overhead (0 byte vs 1 or 2 bytes per new value)

```js
	...
	const encoderDic = new DicCoder255(coder, 'DoubleLE', true);
	const decoderDic = new DicCoder255(coder, 'DoubleLE', false);
	
	encoderDic.encode(1.234);
	encoderDic.encode(5.67);
	encoderDic.encode(8.9);
	
	encoderDic.saveNext();//1(len) + 3*8(double) = 25
	
	encoderDic.writeNext(1.234); //1 bytes  
	encoderDic.writeNext(5.67)   //1 bytes
	encoderDic.writeNext(1.234)  //1 bytes
	encoderDic.writeNext(5.67)   //1 bytes
	encoderDic.writeNext(8.9)    //1 bytes	
	//                   25+5*1 = 30 bytes
	
	decoderDic.loadNext()    
	decoderDic.readNext() // 1.234
	decoderDic.readNext() // 5.67
	...
```