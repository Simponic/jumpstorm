import { compatto } from './compatto';
import dictionary from './dictionary';

const { compress, decompress } = compatto({ dictionary });

const replacer = (_key: any, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries())
    };
  } else {
    return value;
  }
};

const sortObj = (obj: any): any =>
  obj === null || typeof obj !== 'object'
    ? obj
    : Array.isArray(obj)
    ? obj.map(sortObj)
    : Object.assign(
        {},
        ...Object.entries(obj)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([k, v]) => ({ [k]: sortObj(v) }))
      );

const reviver = (_key: any, value: any) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};

// "deterministic" stringify

export const stringify = (obj: any): string => {
  return JSON.stringify(sortObj(obj), replacer);
};

export const serialize = (obj: any): Uint8Array => {
  //return new Uint8Array(new TextEncoder().encode(stringify(obj)));
  return compress(stringify(obj));
};

export const parse = <T>(serialized: Uint8Array): T => {
  //return JSON.parse(new TextDecoder().decode(serialized), reviver) as T;
  return JSON.parse(decompress(serialized), reviver) as T;
};
