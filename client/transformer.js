const numberByteLength = (num) => {
    let count = 0;
    while(num >0){
        num = Math.floor(num/2);
        count++;
    }
    const div = count/8;
    return count%8 === 0 ? div : Math.ceil(div);
}


const getBufferSize = (length) => {
    if(length === 1){
        return 1;
    }
    if(length <=2){
        return 2;
    }
    if(length <=4){
        return 4;
    }
    return 8;
}

export const transformTypeToByte = (value) => {
    switch(typeof value){
        case 'boolean':
            const bytes = Buffer.alloc(1);
            bytes[0] = value ? 1 : 0;
            return bytes;
        case 'number':
            if(Number.isInteger(value)){
                const byteLength = numberByteLength(value);
                const bufferSize = getBufferSize(byteLength); 
                const numberBytes = Buffer.alloc(bufferSize);
                if(byteLength === 1){
                    numberBytes.writeUInt8(value,0);
                }
                else if(byteLength <= 2){
                    numberBytes.writeInt16LE(value,0);
                }
                else if(byteLength <= 4){
                    numberBytes.writeInt32LE(value,0);
                }
                else if(byteLength > 4){
                    numberBytes.writeInt64LE(value,0);
                }
                return numberBytes;
            }
        case 'string':
            return Buffer.from(value);
    }
}

const transformByteToType = (type, bytes) => {
    switch(type){
        case 'boolean':
            const buf = Buffer.from(bytes); 
            const num = buf.readUInt8(0);
            return num === 1 ? true : false;
        case 'number':
            const numberBytes = Buffer.from(bytes);
            const byteLength = bytes.length;
            if(byteLength === 1){
                return numberBytes.readUInt8(0);
            }
            else if(byteLength <= 2){
                return numberBytes.readInt16LE(0);
            }
            else if(byteLength <= 4){
                return numberBytes.readInt32LE(0);
            }
            else if(byteLength > 4){
                return numberBytes.readInt64LE(0);
            }
        case 'string':
            return Buffer.from(bytes,'utf-8').toString();
    }
}


export const transformToBytes = (obj) => {
    const byteArray = [];
    const entries = Object.entries(obj);
    for(const [key, value] of entries){
        const keyData = Buffer.from(String(key));
        const keyLength = Buffer.alloc(2);
        keyLength.writeInt16LE(keyData.length, 0);
        
        const valueData = transformTypeToByte(value);
        const valueDataLength = Buffer.alloc(2);
        valueDataLength.writeInt16LE(valueData.length, 0);
        byteArray.push(keyLength, keyData, valueDataLength, valueData);
        
        
        // const bufferTestData = Buffer.concat([keyLength, keyData, valueDataLength, valueData]);
        // const beg = 0;
        // const end = beg + 2;
        // const testKeyLength = Buffer.from(bufferTestData.slice(beg,end)).readInt16LE(0);
        // console.log('length', testKeyLength);
        // const testkey = Buffer.from(bufferTestData.slice(end, end+testKeyLength), 'utf-8').toString(); 
        // console.log(testkey);
    }
    const bytes = Buffer.concat(byteArray);
    const length = Buffer.alloc(2);
    length.writeInt16LE(bytes.length,0);
    return Buffer.concat([length, bytes]);
}

export const transformToJSON = (schema) => (bytes) => {
    const json = {};
    for(let i=0;i<bytes.length;){
        console.log('keyd', i, i+2);
        const keyLength = Buffer.from(bytes.slice(i,i+2)).readInt16LE(0);
        const key = Buffer.from(bytes.slice(i+2, i+2+keyLength), 'utf-8').toString();
        // if(!(key in schema)){
        //     continue;
        // }
        const type = schema[key];
        const begValueOffset = i+2+keyLength;
        const valueLength = Buffer.from(bytes.slice(begValueOffset,begValueOffset+2)).readInt16LE(0);
        const data = transformByteToType(type, bytes.slice(begValueOffset+2, begValueOffset+2+valueLength));
        json[key] = data;
        i= begValueOffset+2+valueLength;
    }
    return json;
}

