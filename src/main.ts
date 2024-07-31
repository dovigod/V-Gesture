// @ts-nocheck
/* @ts-ignore */
// import { VGesture } from '../build/vgesture'
// import { ClickGesturePlugin } from '../build/plugins'
// import { Handedness } from './types';
import { initialize } from "fastdom/extensions/fastdom-promised";
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

  let vGesture = new VGesture({ disableHelper: false })


  await vGesture.initialize();
  const clickGesturePlugin = new ClickGesturePlugin()
  vGesture.register(clickGesturePlugin)
  await vGesture.startDetection()
  // vGesture.endDetection()

  const p = document.getElementById('toggle')!

  let i = 0
  p.addEventListener('click', async () => {
    if (i % 2 === 0) {
      vGesture.endDetection()
    } else {
      vGesture = new VGesture();
      await vGesture.initialize();
      vGesture.register(clickGesturePlugin)
      vGesture.startDetection()
    }

    i++;
  })
}
init()