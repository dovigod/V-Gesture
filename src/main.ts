console.warn = () => { }


import { VGesture } from './VGesture'
async function init() {
  const vGesture = new VGesture();
  await vGesture.initialize();


  vGesture.start()

}
init()