import SegmentNumber from "../../components/number.js";

export class NumberScreenMixin {
    constructor(segments) {
        this.segments = {};
        for (let segment of segments) {
            this.segmentNumber(segment);
        }

        this._dots = null;
        this.dots.off();

    }

    get length() {
        return Object.keys(this.segments).length;
    }

    get dots() {
        if (!this._dots) {
            this._dots = {
                items: document.querySelectorAll(".time--dots .time--dot"),
                isOn: false,
                on() {
                    if (this.isOn) return;
                    if (this.items && this.items.length > 0) {
                        this.items.forEach(function(item) {
                            item.classList.remove("off");
                            this.isOn = true;
                        }.bind(this))
                    }
                },
                off() {
                    if (!this.isOn) return;
                    if (this.items && this.items.length > 0) {
                        this.items.forEach(function(item) {
                            item.classList.add("off");
                            this.isOn = false;
                        }.bind(this))
                    }
                },
            }
        }
        return this._dots;
    }

    segmentNumber(selector) {
        if (!this.segments.hasOwnProperty(selector)) {
            this.segments[selector] = new SegmentNumber(selector);
        }
        return this.segments[selector];
    }

    displayNumber(numbers) {
        this.dots.on();
        const segments = Object.values(this.segments);
        const  segmentsLength = segments.length;
        numbers = numbers.slice(numbers.length - segmentsLength, numbers.length);
        for (let i = 0; i < numbers.length; i++) {
            let number = numbers[i];
            number = Number.parseInt(number);
            if (!Number.isNaN(number)) {
                if (i < segmentsLength) {
                    segments[i].show(number);
                }
            }
        }
    }

    off() {
        this.dots.off();
        Object.values(this.segments).forEach(function(segment) {
            segment.off();
        });
    }
}

export class IntervalRefreshMixin {
    constructor(callback, interval=1000) {
        this.callback = callback;
        this.timer = null;
        this.interval = interval;

    }

    start(imediate=true) {
        if (!this.timer) {
            if (this.callback && typeof this.callback === "function") {
                if(imediate) {
                    this.callback();
                }
            } else {
                this.callback = function() {};
            }
            this.timer = setInterval(
                this.callback,
                this.interval
            );

        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer, this.callback);
        }
        this.timer = null;
    }
}