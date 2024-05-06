
import SegmentNumber from "../components/number.js";

class NumberScreenMixin {
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

class IntervalRefreshMixin {
    constructor(callback, interval=1000) {
        this.callback = callback;
        this.timer = null;
        this.interval = interval;

    }

    start() {
        if (!this.timer) {
            if (this.callback && typeof this.callback === "function") {
                this.callback();
            }
            this.timer = setInterval(this.callback, this.interval);

        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer, this.callback);
        }
        this.timer = null;
    }
}

class HourScreen {
    constructor(refreshInterval=1000) {
        this.timer = new IntervalRefreshMixin(this.refresh.bind(this), refreshInterval);
        this.segments = new NumberScreenMixin([
            "#timeHourL",
            "#timeHourR",
            "#timeMinuteL",
            "#timeMinuteR",
            "#timeSecondL",
            "#timeSecondR",
        ])
    }
    

    off() {
        this.segments.off();
        this.timer.stop();
    }

    start() {
        this.timer.start();
    }

    refresh() {
        const time = (new Date(Date.now())).toLocaleTimeString();
        this.segments.displayNumber([
            ...time.replaceAll(":", "")
        ]);
    }

}

class ChronoPanel {
    constructor(selector, screen) {
        this.screen = screen;
        this.element =  document.querySelector(selector);
        this.buttons = this.element.querySelectorAll("button");
        this.buttons.forEach(function(item) {
            item.addEventListener("click", function(event) {
                event.preventDefault();
                this.actionButton(event.target);
            }.bind(this))
        }.bind(this))
    }

    actionButton(button) {
        const self = this;
        const actions = {
            "chronoPlay": self.playPressed.bind(self),
            "chronoPause": self.pausePressed.bind(self),
            "chronoRestart": self.restartPressed.bind(self),
        }   
        if (!actions.hasOwnProperty(button.id)) {
            return;
        }
        const fn = actions[button.id];
        if (fn && typeof fn == "function") {
            fn(button);
        }
    } 

    getButton(id) {
        for (let button of this.buttons) {
            if (button.id === id) return button;
        }
        return null;
    }

    playPressed(button) {
        this.displayRun();    
        this.screen.run();
    }

    displayRun() {
        const playButton = this.getButton("chronoPlay");
        const pauseButton = this.getButton("chronoPause");
        playButton.classList.add("d-none");
        pauseButton.classList.remove("d-none");
        playButton.classList.remove("active");
        pauseButton.classList.add("active");
        return;
    }
    pausePressed(button) {
       this.displayStop();
       this.screen.stopRun();
    }

    displayStop() {
        const playButton = this.getButton("chronoPlay");
        const pauseButton = this.getButton("chronoPause");
        playButton.classList.remove("d-none");
        pauseButton.classList.add("d-none");
        playButton.classList.add("active");
        pauseButton.classList.remove("active");
        return;
    }
    restartPressed(button) {
        this.displayStop();
        this.screen.stopRun();
        this.screen.init();
        return;
    }


    start() {
        this.displayStop();
        this.element.classList.add("active");
        this.element.classList.add("back");
        setTimeout(function() {
            this.element.classList.add("front");
            this.element.classList.remove("back");
        }.bind(this), 800);
    }
    
    off() {
        this.displayStop();
        this.element.classList.remove("active");
        this.element.classList.add("back");
        this.element.classList.remove("front");
    }
}

class ChronoScreen extends HourScreen {
    constructor() {
        super(100);
        this._currentValue = 0; 
        this.panel = new ChronoPanel(".chrono-panel", this);
    }

    get currentRepValue() {
        let value = this._currentValue.toString();

        while (value.length < this.segments.length) {
            value = "0" + value;
        }
        return value;
    }

    get currentValue() {
        return this._currentValue;
    }

    set currentValue(value) {
        value = Number.parseInt(value);
        if (!Number.isNaN(value)) {
            this._currentValue = value;
        }
    }

    init() {
        this.currentValue = 0;
        this.refresh();
        // this.pausePressed();
    }

    refresh() {
        this.segments.displayNumber([
            ...this.currentRepValue
        ]);
        this.currentValue = this.currentValue + 1;
    }

    run() {
        super.start();
    }

    stopRun() {
        this.timer.stop();
    }

    start() {
        // super.start();
        this.panel.start();
        this.init();
    }
    
    off() {
        super.off();
        this.panel.off();
    }
}

export class Screen {
    constructor() {
        this.screens = {
            "hour": new HourScreen(),
            "chrono": new ChronoScreen(),
        };
        this.currentMode = "hour";

        document.addEventListener("mode:set", function(event) {
            if (event.detail) {
                const mode = event.detail.mode;
                if(!this.screens.hasOwnProperty(mode)) {throw new Error("Not suported mode : " + mode)};
                this.setMode(mode);
                if (event.detail.callback && typeof event.detail.callback == "function") {
                    event.detail.callback();
                }
            }
        }.bind(this))
    }

    setMode(mode) {
        Object.values(this.screens).forEach(function(screen) {
            screen.off();
        })
        this.currentMode = mode;
    }

    start() {
        this.screens[this.currentMode].start();
    }

    off() {
        this.screens[this.currentMode].off();
    }

    
}
