export const protect = (obj: object, $setterAccessKey: Symbol, deep = false) => {
  const trap = {
    get: (target: typeof obj, key: keyof typeof obj, receiver: any): unknown => {
      if (deep && typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], trap)
      }
      return Reflect.get(target, key, receiver);
    },
    set: (target: typeof obj, key: keyof typeof obj, envelop: { accessKey: Symbol, value: any } | any) => {
      // protected property
      if (key[0] === '_') {
        if (envelop.accessKey === $setterAccessKey) {
          (target as any)[key as any] = envelop.value;
          return true;
        } else {
          return false
        }
      }
      (target as any)[key as any] = envelop;
      return true
    }
  }

  return new Proxy(obj, trap);
}

export function createMutationEnvelop<T>($setterKey: Symbol, value: T): T {
  const envelop = {
    accessKey: $setterKey,
    value
  };
  return envelop as T
}