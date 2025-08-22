
import axios from 'axios';
import { exportBody, transformToJSON, transformTypeToByte } from './transformer.js';

class Client {
    #schema = null;
    #url = null;

    constructor({url}){
        if(!url){
            throw new Error("Missing url");
        }
        this.#url = url;
    }

    #createHeaderInfo(endpoint, method){
        const endpointData = transformTypeToByte(endpoint);
        const endpointDataLength = Buffer.alloc(2);
        endpointDataLength.writeInt16LE(endpointData.length);

        const methodData = transformTypeToByte(method);
        const methodDataLength = Buffer.alloc(2);
        methodDataLength.writeInt16LE(methodData.length);

        return Buffer.concat([endpointDataLength, endpointData, methodDataLength, methodData]);
    }

    get(schema) {
        // return async(endpoint, queryParams) => {
        //     const body = transformToBytes(queryParams);
        //     const headerInfo = this.#createHeaderInfo(endpoint, 'GET'); // method & endpoint
        //     const rawData = Buffer.concat([headerInfo,body]); // TRANSORM TO BYTES
        //     console.log(rawData);
        //     const result = await axios.get(this.#url, rawData, {
        //         headers: {
        //             'Content-Type': 'application/octet-stream', // or other MIME type as needed
        //             'Content-Length': rawData.length
        //         },
        //         responseType:'arraybuffer'
        //     });
        //     const output = result?.data;
        //     return transformToJSON(schema)(output);
        //     /// TRANSFORM FROM BYTES TO JSON
        // }
        return async(endpoint) => {
            
            const result = await axios.get(`${this.#url}${endpoint}`, {
                responseType:'arraybuffer'
            });
            const output = result?.data || [];
            const length = Buffer.from(output.slice(0, 2)).readInt16LE(0);
            if(length > 0){
                console.log('length', length);
                return transformToJSON(schema)(output.slice(2, 2 + length));
            }
            /// TRANSFORM FROM BYTES TO JSON
        }
    }

    post(schema){
        return async(endpoint, jsonData) => {
            const body = exportBody(jsonData);
            const headerInfo = this.#createHeaderInfo(endpoint, 'POST'); // method & endpoint
            const rawData = Buffer.concat([headerInfo,body]); // TRANSORM TO BYTES

            // const endpointBeg = 0;
            // const endpointEnd = 2;
            // const endpointLength = Buffer.from(
            // rawData.slice(endpointBeg, endpointEnd)
            // ).readInt16LE(0);
            // const e = Buffer.from(
            // rawData.slice(endpointEnd, endpointEnd + endpointLength),
            // "utf-8"
            // ).toString();
            // console.log('endpoint', e, endpointLength);
            // const methodBeg = endpointEnd + endpointLength;
            // const methodEnd = methodBeg + 2;
            // const methodLength = Buffer.from(
            // rawData.slice(methodBeg, methodEnd)
            // ).readInt16LE(0);
            // const method = Buffer.from(
            // rawData.slice(methodEnd, methodEnd + methodLength),
            // "utf-8"
            // ).toString();
            // console.log('method', method, methodLength);

            const result = await axios.post(this.#url, rawData, {
                headers: {
                    'Content-Type': 'application/octet-stream', // or other MIME type as needed
                    'Content-Length': rawData.length
                },
                responseType:'arraybuffer'
            });
            const output = result?.data || [];
            const length = Buffer.from(output.slice(0, 2)).readInt16LE(0);
            if(length > 0){
                console.log('length', length);
                return transformToJSON(schema)(output.slice(2, 2 + length));
            }
            /// TRANSFORM FROM BYTES TO JSON
        }
    }
}

export default Client;