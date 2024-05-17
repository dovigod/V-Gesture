import type { OperationKey } from "../Gestures/Gesture";
import { error } from '../utils/console'
import { operations } from './operations'
import { FUNCTION_NOTATION, VARIABLE_NOTATION } from '../constant'




export function getOperationReciept(operationKey: OperationKey) {
  const type = operationKey.startsWith(FUNCTION_NOTATION) ? 'function' : operationKey.startsWith(VARIABLE_NOTATION) ? 'variable' : 'invalid';

  switch (type) {
    case 'function': {
      let operationPayload: string | string[] = operationKey.split(FUNCTION_NOTATION)[1];
      operationPayload = operationPayload.split('-')
      const functionName = operationPayload.shift()!;
      const args = operationPayload;

      if (!(functionName in operations)) {
        error(`function ${functionName} is not supported`)
      }
      return {
        type: 'function',
        func: operations[functionName],
        vars: args
      }
    }
    case 'variable': {
      const operationPayload = operationKey.split(VARIABLE_NOTATION)[1];

      return {
        type: 'variable',
        vars: operationPayload
      }
    }
    default: {
      error(`operation ${operationKey} is not a valid format`)
      return null;
    }
  }
}