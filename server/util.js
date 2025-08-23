
import { compressSync, decompressSync, strToU8, strFromU8 } from 'fflate';

export const compress = (data) => {
    return compressSync(strToU8(data));
}

export const uncompress = (data) => {
    return strFromU8(decompressSync(data));
}