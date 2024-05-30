# V-Gesture

[//]: <> (start placeholder for auto-badger)

![NPM License](https://img.shields.io/npm/l/%40dvgs%2Fvgesture)
[![version](https://img.shields.io/npm/v/@dvgs/vgesture.svg?style=flat-square)](https://npmjs.org/@dvgs/vgesture)
![npm package minimized gzipped size (scoped)](https://img.shields.io/bundlejs/size/%40dvgs/vgesture)


[//]: <> (end placeholder for auto-badger)
Typescript library which gives ability to interact with DOM elements with hand gestures via webcam.

**_Note:_** This project isn't well tested for production, and requires major browser versions to run. So I highly recommend not to use it on production.

https://github.com/dovigod/V-Gesture/assets/30416914/05e9e1f6-ccc5-47f5-9fab-afaab3bb775d

## Installation

```
npm install @dvgs/vgesture
```

## Usage

### Create **"gesturable element"**

Most of Elements with `vgestureable` attribute will be assumed as "gesturable"
**_exceptions:_** [here](https://github.com/dovigod/V-Gesture/blob/main/src/utils/dom/traverse.ts)

```
// index.html
...
<div vgesturable onclick="..."> This is gesture interactable element</div>
<div vgesturable onclick="..."> This is gesture interactable element</div>
...
```

### Initialize VGesture

```
import { VGesture } from '@dvgs/vgesture

const vGesture = new VGesture()
await vGesture.initialize()
```

### Register Gesture

```
import { ClickGesturePlugin } from '@dvgs/vgesture/plugins

vGesture.register(new ClickGesturePlugin())
```

### Run

```
vGesture.startDetection()
```

## Creating gesture

VGesture provides [plugin](https://github.com/dovigod/V-Gesture/blob/main/src/Plugins/Plugin.ts) and [gesture](https://github.com/dovigod/V-Gesture/blob/main/src/Gestures/Gesture.ts) interface to easily create and use gesture defined by yourself.

### Gesture

A _`Gesture`_ is a actual implementation of gesture.

#### `Gesture.name`

Type : `string`

Name of gesture. The value should be unique among registered gestures.

#### `Gesture.eventName`

Type : `string`

Name of the event which will be dispatched when gesture is held.

#### `Gesture.requestedOperations`

Type : `OperationKey[]`

An IDL to get cached operation results or cache operation

#### `Gesture.determinant`

Type : `(hands:  Hand[], requestedOperations?:  Record<OperationKey, any>) => {x : number , y: number} | boolean`

**(Important)**

_determinant_ is the function which determines whether current user's hand pose is fulfilling the gesture.
if false is returned, it means current hand pose is not a gesture.
if true or any truthy value is returned, it means current hand pose is a gesture.
Besides, if you want to mark hit point on browser, return `{x: number , y: number}`

#### `Gesture.usedHand`

Type : `Handedness`

Direction of hand which will be used for gesture

#### `Gesture.handler`

Type : `(event: CustomEvent, dataDomain:  DataDomain, triggerHelperElem?:  HTMLElement):  void`

handler function when %eventName% is emitted to Window object
Normally used for handling events or to dispatch native event as a chain

### Plugin

A _`Plugin`_ is a intermediate layer between `VGesture` and `Gesture`.
Its main purpose is to provide `Gesture` to `VGesture` and makes easy to deal with backwards-incompatible changes.

#### `Plugin.gesture`

Type : `AbstractGesture`
Actual Gesture implementation Instance.

#### `Plugin.register`

Type : `(gestureManager: VGesture) => VGesture`

(Optional) function which defines a way to handle register phase(adding event listeners, warm-up etc..). 

By default, built-in `register` method will be used. [here](https://github.com/dovigod/V-Gesture/blob/main/src/utils/prebuilt/index.ts)


#### `Plugin.unregister`

Type : `(gestureManager: VGesture) => VGesture`

(Optional) function which defines a way to handle unregister phase(removing event listeners, clearing memory for plugin layer etc..). 

By default, built-in `unregister` method will be used. [here](https://github.com/dovigod/V-Gesture/blob/main/src/utils/prebuilt/index.ts)


## Reference
#### `VGesture.initialize`

Type : `() => Promise<void>`

Initalize VGesture

By calling this function, every core resources will be set-up(e.g MediaStream, DOM elements, DataDomain etc).

**NOTE)** Webcam authentication modal will be called when this function gets invoked.

#### `VGesture.register`

Type : `(plugin : AbstractGesturePlugin) => void`

Registers provided plugin to VGesture.

This could be held during detection.


#### `VGesture.unregister`

Type : `(gestureName: string) => void`

Discard plugin from VGesture by `gesture.name`.

This could be held during detection.

#### `VGesture.startDetection`

Type : `() => Promise<void>`

Starts gesture detection.


#### `VGesture.endDetection`

Type : `() => void`

Ends gesture detection, and clear up VGesture session.

Re-instantiation is required for restart.



#### `VGesture.flush`

Type : `() => void`

VGesture contains `MutationObserver` under the hood which is used to detect any changes under decendant of `document.body`. Although DOM updates are reflected to `VGesture.DataDomain` via `MutationObserver`, it can't detect CSSOM changes such as stylesheet updates (e.g responsive web).

Since its quite cumbersome and it might cause performance issues to detect CSSOM changes, use this function to manually update `VGesture.DataDomain` in case of reflow occurs for `vgesturable` element.



## Requestable Operations / variables

**Note**) When requesting function operation, parameters should be ordered alphabetical.

```
const type = 'function' ? 'func' : 'variable' : 'var' : '';
let schema = `${type}::${name}`

//ex) requesting variable
"var::indexTip"

//ex) requesting function
// wrong :: "func::get2FingerDistance-indexTip-indexDip"
// correct :: "func::get2FingerDistance-indexDip-indexTip"
```



| Name            |                                                                        Type                                                                        |   Description                                                                                                                                                           |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  get2FingerDistance | function  | get distance between provided finger tip parameter |
| indexTip | variable | index tip coordinate [index: 9] |
| thumbTip | variable | thumb tip coordinate [index: 4] |
| pinkyTip | variable | pinky tip coordinate [index: 20] |
| ringTip | variable | ring tip coordinate [index: 16] |
| middleTip | variable | middle tip coordinate [index: 12] |
| thumbIp | variable | thumbIp coordinate [index: 3] |
| thumbMcp | variable | thumbMcp coordinate [index: 2] |
| thumbCmc | variable | thumbCmc coordinate [index: 1] |
| indexMcp | variable | indexMcp coordinate [index: 5] |
| indexPip | variable | indexPip coordinate [index: 6] |
| indexDip | variable | indexDip coordinate [index: 7] |
| middleMcp | variable | middleMcp coordinate [index: 9] |
| middlePip | variable | middlePip coordinate [index: 10] |
| middleDip | variable | middleDip coordinate [index: 11] |
| ringMcp | variable | ringMcp coordinate [index: 13] |
| ringPip | variable | ringPip coordinate [index: 14] |
| ringDip | variable | ringDip coordinate [index: 15] |
| pinkyMcp | variable | pinkyMcp coordinate [index: 17] |
| pinkyPip | variable | pinkyPip coordinate [index: 18] |
| pinkyDip | variable | pinkyDip coordinate [index: 19] |
