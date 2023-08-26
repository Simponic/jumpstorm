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

const reviver = (_key: any, value: any) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};

export const stringify = (obj: any) => {
  return JSON.stringify(obj, replacer);
};

export const parse = <T>(str: string) => {
  return JSON.parse(str, reviver) as unknown as T;
};
