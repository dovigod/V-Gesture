// @ts-nocheck
/* @ts-ignore */
// import { VGesture } from '../build/vgesture'
// import { ClickGesturePlugin } from '../build/plugins'
// import { Handedness } from './types';
import { VGesture } from "./VGesture";
import { ClickGesturePlugin } from "./plugins";
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
  // vGesture.endDetection()
}
init()