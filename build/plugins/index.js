var Handedness;
(function (Handedness) {
    Handedness["LEFT"] = "left";
    Handedness["RIGHT"] = "right";
})(Handedness || (Handedness = {}));
var ERROR_TYPE;
(function (ERROR_TYPE) {
    ERROR_TYPE["VALIDATION"] = "validation-error";
    ERROR_TYPE["UNKNOWN"] = "unknown-error";
    ERROR_TYPE["PREDICTION"] = "prediction-error";
    ERROR_TYPE["UNSUPPORT"] = "unsupport-error";
    ERROR_TYPE["NOT_ALLOWED"] = "not-allowed-error";
})(ERROR_TYPE || (ERROR_TYPE = {}));
var SESSION_STATE;
(function (SESSION_STATE) {
    SESSION_STATE["IDLE"] = "idle";
    SESSION_STATE["READY"] = "ready";
    SESSION_STATE["RUNNING"] = "running";
    SESSION_STATE["FINISHED"] = "finished";
})(SESSION_STATE || (SESSION_STATE = {}));

class ClickGestureEvent extends Event {
    constructor(type, gestureInfo, eventInitDict) {
        super(type, eventInitDict);
        Object.defineProperty(this, "indexTip", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thumbTip", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "triggerPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.indexTip = gestureInfo.indexTip;
        this.thumbTip = gestureInfo.thumbTip;
        this.triggerPoint = {
            x: window.innerWidth - (this.indexTip.x + this.thumbTip.x) / 2,
            y: (this.indexTip.y + this.thumbTip.y) / 2,
        };
    }
}

class ClickGesture {
    constructor(config) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'clickGesture'
        });
        Object.defineProperty(this, "eventName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'clickGesture'
        });
        Object.defineProperty(this, "usedHand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dispatchInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "threshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_test", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "operationsRequest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                "func::get2FingerDistance-thumbTip-indexTip",
                "func::get2FingerDistance-thumbTip-middleTip",
                "var::thumbTip",
                "var::indexTip"
            ]
        });
        this.dispatchInterval = config?.dispatchInterval || 500;
        this.threshold = config?.threshold || 1200;
        this.usedHand = config?.usedHand || Handedness.LEFT;
    }
    handler(event, dataDomain, triggerHelperElem) {
        const e = event;
        if (triggerHelperElem) {
            triggerHelperElem.style.top = e.triggerPoint.y + 'px';
            triggerHelperElem.style.left = e.triggerPoint.x + 'px';
        }
        const pivot = [e.triggerPoint.x, e.triggerPoint.y];
        const closestNode = dataDomain.searchClosest(pivot);
        // current event is held inner boundary of closestNode
        if (closestNode) {
            if (pivot[0] >= closestNode.boundary[0] - closestNode.boundary[2] &&
                pivot[0] <= closestNode.boundary[0] + closestNode.boundary[2] &&
                pivot[1] >= closestNode.boundary[1] - closestNode.boundary[3] &&
                pivot[1] <= closestNode.boundary[1] + closestNode.boundary[3]) {
                const nodeId = closestNode.id;
                if (nodeId) {
                    const node = document.getElementById(nodeId);
                    node?.dispatchEvent(new Event('click'));
                }
            }
        }
    }
    determinant(hands, requestedOperations) {
        //cool down
        if (this.timer) {
            return false;
        }
        if (hands.length === 0) {
            return false;
        }
        const distance = requestedOperations['func::get2FingerDistance-thumbTip-indexTip'];
        const indexTip = requestedOperations['var::indexTip'];
        const thumbTip = requestedOperations['var::thumbTip'];
        if (indexTip && thumbTip) {
            if (distance <= this.threshold) {
                dispatchEvent(new ClickGestureEvent(this.eventName, { indexTip, thumbTip }));
                this.timer = setTimeout(() => {
                    this.timer = null;
                }, this.dispatchInterval);
                return { x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 };
            }
        }
        return false;
    }
}

class ClickGesturePlugin {
    constructor(config) {
        Object.defineProperty(this, "gesture", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "handlerFunc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.gesture = new ClickGesture(config);
    }
    register(vGesture) {
        if (this.handlerFunc) {
            window.removeEventListener(this.gesture.eventName, this.handlerFunc);
        }
        this.handlerFunc = (e) => {
            this.gesture.handler(e, vGesture.gestureTargetCollection);
        };
        window.addEventListener(this.gesture.eventName, this.handlerFunc);
        return vGesture;
    }
    unregister() {
        if (this.handlerFunc) {
            window.removeEventListener(this.gesture.eventName, this.handlerFunc);
            this.handlerFunc = null;
        }
    }
}

export { ClickGesturePlugin };
