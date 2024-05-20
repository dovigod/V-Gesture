import { VGesture } from './VGesture'
import { ClickGesturePlugin } from './Plugins/ClickGesturePlugin'
async function init() {
  const vGesture = new VGesture();

  await vGesture.initialize();
  const clickGesturePlugin = new ClickGesturePlugin({

  })

  vGesture.register(clickGesturePlugin)
  await vGesture.startDetection()
  // await vGesture.startDetection()
}
init()