import { warn } from '../console';


const actions = {
  'enableHelper': (val: boolean) => !val
} as Record<string, Function | undefined>
const props = {
  'usedHand': 'hand',
  'disableHelper': 'enableHelper',
  'operationsRequest': 'operations'
} as Record<string, string>

// Check the interface of the parameter and apply a polyfill if any property name seems to be stale
export function compatiblizeParam<T>(params: T): T {
  const origin = params as Record<string, unknown>

  let polyfilled = origin;
  if (origin.constructor.name === 'Object') {
    polyfilled = { ...origin }
  }

  for (const key of Object.keys(origin)) {
    const latestKey = props[key];

    if (typeof origin[key] === 'object' && !(origin[key] instanceof Array) && origin[key]) {
      polyfilled[key] = compatiblizeParam(origin[key])
    }
    if (latestKey) {
      const value = origin[key]
      const action = actions[latestKey]
      delete polyfilled[key];
      polyfilled[latestKey] = action ? action(value) : value
      warn(`Property "${key}" is not used anymore. Please use "${latestKey}"`)
    }
  }
  return polyfilled as T
}