# V-Gesture

[//]: <> (start placeholder for auto-badger)

[![version](https://img.shields.io/npm/v/@dvgs/vgesture.svg?style=flat-square)](https://npmjs.org/@dvgs/vgesture)
[![license](https://img.shields.io/npm/l/@dvgs/vgesture?color=%23007a1f&style=flat-square)](https://github.com/dovigod/V-Gesture/LICENSE)

[//]: <> (end placeholder for auto-badger)
Typescript library which gives ability to interact with DOM elements with hand gestures via webcam.

**_Note:_** This project isn't well tested for production, and requires major browser versions to run. So I highly recommend not to use it on production.

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

_determinant_ is the function which determine current user's hand pose is fulfilling gesture.
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
**(Soon will be removed)**

#### `Plugin.unregister`

Type : `(gestureManager: VGesture) => VGesture`
**(Soon will be removed)**
