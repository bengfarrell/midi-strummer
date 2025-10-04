export const parseRangeData = (data: number[], byteIndex: number, min = 0, max = 0) => {
    return (parseInt(data[byteIndex].toString(16), 16) - min) / (max - min);
}

export const parseWrappedRangeData = (data: number[], byteIndex: number, posmin = 0, posmax = 0, negmin = 0, negmax = 0) => {
    const value = parseInt(data[byteIndex].toString(16), 16);
    return value < negmax ? value / (posmax - posmin) : -(negmin - value) / (negmin - negmax);
}

export const parseCode = (data: number[], byteIndex: number, values: number[]) => {
    const code = parseInt(data[byteIndex].toString(16), 16);
    return values[code];
}