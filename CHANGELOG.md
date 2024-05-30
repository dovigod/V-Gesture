# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.4](https://github.com/dovigod/V-Gesture/compare/v1.1.3...v1.1.4) (2024-05-30)


### Others

* builds ([6beff1c](https://github.com/dovigod/V-Gesture/commit/6beff1c584ad2a45fcfc846a35e9b69f9c50245d))

### [1.1.3](https://github.com/dovigod/V-Gesture/compare/v1.1.2...v1.1.3) (2024-05-30)

### [1.1.2](https://github.com/dovigod/V-Gesture/compare/v1.1.1...v1.1.2) (2024-05-30)

### [1.1.1](https://github.com/dovigod/V-Gesture/compare/v1.1.0...v1.1.1) (2024-05-30)


### Feature Improvements

* make register & unregister optional for abstractGesturePlugin ([#43](https://github.com/dovigod/V-Gesture/issues/43)) ([1d169b9](https://github.com/dovigod/V-Gesture/commit/1d169b9cb458aa864fc5b320db451d071a2971a1))
* reflect dom changes to dataDomain ([#44](https://github.com/dovigod/V-Gesture/issues/44)) ([92dbedf](https://github.com/dovigod/V-Gesture/commit/92dbedfa907482dd3a4bc40df68b5f225b520d20))

## 1.1.0 (2024-05-30)


### Features

* Add more controls for helper ([#32](https://github.com/dovigod/V-Gesture/issues/32)) ([9eb08a2](https://github.com/dovigod/V-Gesture/commit/9eb08a26af471082386e5eae5277fe929c6fbcb3))
* gClickable attribute to recognize dom elem as g-clickable element, prevent layout trashing with async reflow ([#9](https://github.com/dovigod/V-Gesture/issues/9)) ([c87653c](https://github.com/dovigod/V-Gesture/commit/c87653c12b60af4913c9d7e3e75bf9e1833f21dc))
* Hand Tracking ([066e66e](https://github.com/dovigod/V-Gesture/commit/066e66e34a23760bcb06d74440b11794c94513a9))
* plugin interface created ([#20](https://github.com/dovigod/V-Gesture/issues/20)) ([25385fc](https://github.com/dovigod/V-Gesture/commit/25385fc9ffd59839f6821a72b98e3bb09123e8aa))
* V-Gesture interface created ([#16](https://github.com/dovigod/V-Gesture/issues/16)) ([4d582a4](https://github.com/dovigod/V-Gesture/commit/4d582a422be3f4aa50b58e5d1c53618781d34d5c))


### Bug Fixes

* cleraRect will exec with canvas dimension param ([#40](https://github.com/dovigod/V-Gesture/issues/40)) ([5b1c2d6](https://github.com/dovigod/V-Gesture/commit/5b1c2d6d5f1721bf42b1abd8e83ba27f17a5918f))
* memory leak issue while unregistering & stopDetection ([#30](https://github.com/dovigod/V-Gesture/issues/30)) ([9ae44e8](https://github.com/dovigod/V-Gesture/commit/9ae44e8581e13d42a985516b20c0dec69a5735a6))


### Code Refactoring

* weaken coupling for each modules ([#28](https://github.com/dovigod/V-Gesture/issues/28)) ([606cb90](https://github.com/dovigod/V-Gesture/commit/606cb90ba0b24f58b55083c1b829fd64a535a9e0))


### Others

* clean up ([#37](https://github.com/dovigod/V-Gesture/issues/37)) ([32ab558](https://github.com/dovigod/V-Gesture/commit/32ab558b47e9fb003b2828a04d8b8713a3b13171))
* discard magic words & declare types for any keyword ([#26](https://github.com/dovigod/V-Gesture/issues/26)) ([4ae7b52](https://github.com/dovigod/V-Gesture/commit/4ae7b52e9c200be2c7442a6b56acc606139f1267))
* exports for dist renamed ([40811e2](https://github.com/dovigod/V-Gesture/commit/40811e27d939009d62831dae893de093732d1dd2))
* **release:** 0.0.1 ([e956341](https://github.com/dovigod/V-Gesture/commit/e956341f7d546fc918e4afe85043aa8997523418))
* relocate files and clean up unused codes ([#34](https://github.com/dovigod/V-Gesture/issues/34)) ([eff8c13](https://github.com/dovigod/V-Gesture/commit/eff8c136ec892b7562ca50f381a23b1c4c119679))
* rename file entry ([8a01646](https://github.com/dovigod/V-Gesture/commit/8a0164670254809becf02ed71f1e75224f3906ff))
* update feature-request template ([#10](https://github.com/dovigod/V-Gesture/issues/10)) ([571dcdf](https://github.com/dovigod/V-Gesture/commit/571dcdfa819ccc530f051cb240666b7eb51abda1))
* use conventional commits and release script set ([#11](https://github.com/dovigod/V-Gesture/issues/11)) ([4286926](https://github.com/dovigod/V-Gesture/commit/42869265ed0e433ff6949e6751713720debc159b))
* writing draft ([4dd3d25](https://github.com/dovigod/V-Gesture/commit/4dd3d257ff74d420b5e7e61c86f6a053a0bc60ff))


### Feature Improvements

* created gesture handler to manage plugin & others connection ([#21](https://github.com/dovigod/V-Gesture/issues/21)) ([afb3069](https://github.com/dovigod/V-Gesture/commit/afb306928f3931ed14245ce27f3dfdd6ed72b64f))
* rename g-clickable-element attribute to vgesturable ([#35](https://github.com/dovigod/V-Gesture/issues/35)) ([a854d82](https://github.com/dovigod/V-Gesture/commit/a854d82befa1e46110b7ca5c65dd8496611b4c0f))
* rename packagename with org ([a6e3cbd](https://github.com/dovigod/V-Gesture/commit/a6e3cbd84d99d9c5ee394ecd405c9a1558402edc))
* Responsivness ([#36](https://github.com/dovigod/V-Gesture/issues/36)) ([a163ca9](https://github.com/dovigod/V-Gesture/commit/a163ca99f6f042e183f8c26cdda602f9f619093d))
* stale session on error during prediction ([#31](https://github.com/dovigod/V-Gesture/issues/31)) ([b9c41f9](https://github.com/dovigod/V-Gesture/commit/b9c41f971be3cef9403a1bc995f6df924f3109cd))
* tips visualizing on stage ([#24](https://github.com/dovigod/V-Gesture/issues/24)) ([d52435a](https://github.com/dovigod/V-Gesture/commit/d52435ab3de5501ce8759d23b5ef580552aace9e))

### [0.0.16](https://github.com/dovigod/V-Gesture/compare/v0.0.15...v0.0.16) (2024-05-23)


### Others

* test ([6873bbb](https://github.com/dovigod/V-Gesture/commit/6873bbb343f5890e84550d39da8c688dfd5c2e42))

### [0.0.15](https://github.com/dovigod/V-Gesture/compare/v0.0.11...v0.0.15) (2024-05-23)


### Bug Fixes

* cleraRect will exec with canvas dimension param ([#40](https://github.com/dovigod/V-Gesture/issues/40)) ([b01a4c8](https://github.com/dovigod/V-Gesture/commit/b01a4c807bd3024ee97259df78c3cc9b7be4244f))


### Others

* build config changed ([1e691a0](https://github.com/dovigod/V-Gesture/commit/1e691a02ac54ac03df74435ba793f1dfc49070fb))
* testing ([0d8edf3](https://github.com/dovigod/V-Gesture/commit/0d8edf3b2e2faf19e4eed7acbf183713ba6f2251))

### [0.0.11](https://github.com/dovigod/V-Gesture/compare/v0.0.10...v0.0.11) (2024-05-23)


### Others

* testing ([c9a2346](https://github.com/dovigod/V-Gesture/commit/c9a23468e02c4ae7b7cd034e37a73b07de6eda5c))

### [0.0.10](https://github.com/dovigod/V-Gesture/compare/v0.0.9...v0.0.10) (2024-05-23)


### Others

* where the hell is my dist ([cd2b34a](https://github.com/dovigod/V-Gesture/commit/cd2b34abf7f2a4cd5bf6d654fc25d8292534e6a5))

### [0.0.9](https://github.com/dovigod/V-Gesture/compare/v0.0.8...v0.0.9) (2024-05-23)


### Others

* discard src from files ([97b1256](https://github.com/dovigod/V-Gesture/commit/97b1256c1980cf991577724df57a9907e1e38f95))

### [0.0.8](https://github.com/dovigod/V-Gesture/compare/v0.0.7...v0.0.8) (2024-05-23)


### Others

* exports for dist renamed ([40811e2](https://github.com/dovigod/V-Gesture/commit/40811e27d939009d62831dae893de093732d1dd2))

### [0.0.7](https://github.com/dovigod/V-Gesture/compare/v0.0.6...v0.0.7) (2024-05-23)


### Feature Improvements

* rename packagename with org ([20f1d4b](https://github.com/dovigod/V-Gesture/commit/20f1d4b4f7e84a0f54dbb6099501c5d9d81c26f6))

### [0.0.6](https://github.com/dovigod/V-Gesture/compare/v0.0.5...v0.0.6) (2024-05-23)


### Feature Improvements

* rename packagename with org ([a00db2d](https://github.com/dovigod/V-Gesture/commit/a00db2ded498a50a05df6020e2586c09475f4370))

### [0.0.5](https://github.com/dovigod/V-Gesture/compare/v0.0.4...v0.0.5) (2024-05-23)


### Feature Improvements

* package name conflict change v-gesture to vgesture ([b742dae](https://github.com/dovigod/V-Gesture/commit/b742dae706f9722cd2357bf7dcd2bf15b8c216e2))

### [0.0.4](https://github.com/dovigod/V-Gesture/compare/v0.0.3...v0.0.4) (2024-05-23)

### [0.0.3](https://github.com/dovigod/V-Gesture/compare/v0.0.2...v0.0.3) (2024-05-23)

### [0.0.2](https://github.com/dovigod/V-Gesture/compare/v0.0.1...v0.0.2) (2024-05-23)


### Others

* repo to public ([0f05634](https://github.com/dovigod/V-Gesture/commit/0f056347383460a84089d1fac4d11cafef2e1d5a))

### 0.0.1 (2024-05-23)


### Features

* Add more controls for helper ([#32](https://github.com/dovigod/V-Gesture/issues/32)) ([9eb08a2](https://github.com/dovigod/V-Gesture/commit/9eb08a26af471082386e5eae5277fe929c6fbcb3))
* gClickable attribute to recognize dom elem as g-clickable element, prevent layout trashing with async reflow ([#9](https://github.com/dovigod/V-Gesture/issues/9)) ([c87653c](https://github.com/dovigod/V-Gesture/commit/c87653c12b60af4913c9d7e3e75bf9e1833f21dc))
* Hand Tracking ([066e66e](https://github.com/dovigod/V-Gesture/commit/066e66e34a23760bcb06d74440b11794c94513a9))
* plugin interface created ([#20](https://github.com/dovigod/V-Gesture/issues/20)) ([25385fc](https://github.com/dovigod/V-Gesture/commit/25385fc9ffd59839f6821a72b98e3bb09123e8aa))
* V-Gesture interface created ([#16](https://github.com/dovigod/V-Gesture/issues/16)) ([4d582a4](https://github.com/dovigod/V-Gesture/commit/4d582a422be3f4aa50b58e5d1c53618781d34d5c))


### Bug Fixes

* memory leak issue while unregistering & stopDetection ([#30](https://github.com/dovigod/V-Gesture/issues/30)) ([9ae44e8](https://github.com/dovigod/V-Gesture/commit/9ae44e8581e13d42a985516b20c0dec69a5735a6))


### Code Refactoring

* weaken coupling for each modules ([#28](https://github.com/dovigod/V-Gesture/issues/28)) ([606cb90](https://github.com/dovigod/V-Gesture/commit/606cb90ba0b24f58b55083c1b829fd64a535a9e0))


### Feature Improvements

* created gesture handler to manage plugin & others connection ([#21](https://github.com/dovigod/V-Gesture/issues/21)) ([afb3069](https://github.com/dovigod/V-Gesture/commit/afb306928f3931ed14245ce27f3dfdd6ed72b64f))
* rename g-clickable-element attribute to vgesturable ([#35](https://github.com/dovigod/V-Gesture/issues/35)) ([a854d82](https://github.com/dovigod/V-Gesture/commit/a854d82befa1e46110b7ca5c65dd8496611b4c0f))
* Responsivness ([#36](https://github.com/dovigod/V-Gesture/issues/36)) ([a163ca9](https://github.com/dovigod/V-Gesture/commit/a163ca99f6f042e183f8c26cdda602f9f619093d))
* stale session on error during prediction ([#31](https://github.com/dovigod/V-Gesture/issues/31)) ([b9c41f9](https://github.com/dovigod/V-Gesture/commit/b9c41f971be3cef9403a1bc995f6df924f3109cd))
* tips visualizing on stage ([#24](https://github.com/dovigod/V-Gesture/issues/24)) ([d52435a](https://github.com/dovigod/V-Gesture/commit/d52435ab3de5501ce8759d23b5ef580552aace9e))


### Others

* clean up ([#37](https://github.com/dovigod/V-Gesture/issues/37)) ([32ab558](https://github.com/dovigod/V-Gesture/commit/32ab558b47e9fb003b2828a04d8b8713a3b13171))
* discard magic words & declare types for any keyword ([#26](https://github.com/dovigod/V-Gesture/issues/26)) ([4ae7b52](https://github.com/dovigod/V-Gesture/commit/4ae7b52e9c200be2c7442a6b56acc606139f1267))
* relocate files and clean up unused codes ([#34](https://github.com/dovigod/V-Gesture/issues/34)) ([eff8c13](https://github.com/dovigod/V-Gesture/commit/eff8c136ec892b7562ca50f381a23b1c4c119679))
* rename file entry ([c638b1f](https://github.com/dovigod/V-Gesture/commit/c638b1f167aa7b679d2c48b29c6ab1c8e61d7e7b))
* update feature-request template ([#10](https://github.com/dovigod/V-Gesture/issues/10)) ([571dcdf](https://github.com/dovigod/V-Gesture/commit/571dcdfa819ccc530f051cb240666b7eb51abda1))
* use conventional commits and release script set ([#11](https://github.com/dovigod/V-Gesture/issues/11)) ([4286926](https://github.com/dovigod/V-Gesture/commit/42869265ed0e433ff6949e6751713720debc159b))
* writing draft ([4dd3d25](https://github.com/dovigod/V-Gesture/commit/4dd3d257ff74d420b5e7e61c86f6a053a0bc60ff))
