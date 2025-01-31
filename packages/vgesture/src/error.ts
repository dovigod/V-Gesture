export class VGestureError extends Error {
  type: string;
  initiate: string;
  constructor(type: string, initiate: string, originalError: any) {
    super(originalError);
    this.type = type;
    this.initiate = initiate;
  }
}