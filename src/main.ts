// @ts-nocheck
/* @ts-ignore */
// import { VGesture } from '../dist/vgesture'
import { VGesture } from '../build/vgesture'
import { ClickGesturePlugin } from '../build/plugins'
// import { ClickGesturePlugin } from '../dist/plugins'
// import { Handedness } from './types';
async function init() {
  // const vGesture = new VGesture({
  //   helper: {
  //     colors: {
  //       'indexTip': '#ff0000'
  //     },
  //     sizes: {
  //       indexTip: 10
  //     },
  //     hitpoint: {
  //       color: '#00ff00',
  //       size: 0
  //     }
  //   },
  // });

  const vGesture = new VGesture()


  await vGesture.initialize();
  const clickGesturePlugin = new ClickGesturePlugin({
  })


  vGesture.register(clickGesturePlugin)
  await vGesture.startDetection()
  // await vGesture.startDetection()
}
init()