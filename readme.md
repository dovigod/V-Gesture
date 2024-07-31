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

### Documentation

[Documentation](https://dovigod.github.io/V-Gesture/) created by _[Typedocs](https://typedoc.org/)_

## Creating gesture

VGesture provides [plugin](https://github.com/dovigod/V-Gesture/blob/main/src/Plugins/Plugin.ts) and [gesture](https://github.com/dovigod/V-Gesture/blob/main/src/Gestures/Gesture.ts) interface to easily create and use gesture defined by yourself.

see an [example](https://github.com/dovigod/V-Gesture/blob/main/examples/createGesture)

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

| Name               |   Type   | Description                                        |
| :----------------- | :------: | :------------------------------------------------- |
| get2FingerDistance | function | get distance between provided finger tip parameter |
| indexTip           | variable | index tip coordinate [index: 9]                    |
| thumbTip           | variable | thumb tip coordinate [index: 4]                    |
| pinkyTip           | variable | pinky tip coordinate [index: 20]                   |
| ringTip            | variable | ring tip coordinate [index: 16]                    |
| middleTip          | variable | middle tip coordinate [index: 12]                  |
| thumbIp            | variable | thumbIp coordinate [index: 3]                      |
| thumbMcp           | variable | thumbMcp coordinate [index: 2]                     |
| thumbCmc           | variable | thumbCmc coordinate [index: 1]                     |
| indexMcp           | variable | indexMcp coordinate [index: 5]                     |
| indexPip           | variable | indexPip coordinate [index: 6]                     |
| indexDip           | variable | indexDip coordinate [index: 7]                     |
| middleMcp          | variable | middleMcp coordinate [index: 9]                    |
| middlePip          | variable | middlePip coordinate [index: 10]                   |
| middleDip          | variable | middleDip coordinate [index: 11]                   |
| ringMcp            | variable | ringMcp coordinate [index: 13]                     |
| ringPip            | variable | ringPip coordinate [index: 14]                     |
| ringDip            | variable | ringDip coordinate [index: 15]                     |
| pinkyMcp           | variable | pinkyMcp coordinate [index: 17]                    |
| pinkyPip           | variable | pinkyPip coordinate [index: 18]                    |
| pinkyDip           | variable | pinkyDip coordinate [index: 19]                    |
