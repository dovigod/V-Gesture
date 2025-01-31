const SUBJECT = '[V-Gesture] '

export const warn = console.warn.bind(console, SUBJECT);
export const debug = console.debug.bind(console, SUBJECT);
export const log = console.log.bind(console, SUBJECT);
export const error = console.error.bind(console, SUBJECT);