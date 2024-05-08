
import { NumberScreenMixin, IntervalRefreshMixin } from "./mixins/utils.js";

class InDocument {
    /* show | off */
    show(arg="show") {
        const $elm = this.$elm;
        if (arg == "show") {
            $elm.classList.remove("d-none");
        }
        if (arg == "hide") {
            $elm.classList.add("d-none");
        }
    }
}

class HourScreen extends InDocument {
    constructor(refreshInterval=1000) {
        super();
        this.selector = "#hourPanel";
        this.$elm = document.querySelector(this.selector);
        this.timer = new IntervalRefreshMixin(this.refresh.bind(this), refreshInterval);
        this.segments = new NumberScreenMixin([
            "#timeHourL",
            "#timeHourR",
            "#timeMinuteL",
            "#timeMinuteR",
            "#timeSecondL",
            "#timeSecondR",
        ]);
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
        }.bind(this), 400);
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
        this.panel.start();
        this.init();
    }
    
    off() {
        super.off();
        this.panel.off();
    }
}

class WeatherScreen extends InDocument {
    constructor(refreshInterval=1000) {
        super();
        this.selector = "#weatherPanel";
        this.$elm = document.querySelector(this.selector);
        //this.timer = new IntervalRefreshMixin(this.refresh.bind(this), refreshInterval);
        
    }
    
    off() {
        //this.timer.stop();
    }

    start() {
        //this.timer.start();
    }

    refresh() {
        
    }

}

export class Screen {
    constructor(initMode="hour") {
        this.screens = {
            "hour": new HourScreen(),
            "chrono": new ChronoScreen(),
            "weath": new WeatherScreen(),
        };
        this.currentMode = initMode;

        document.addEventListener("mode:set", function(event) {
            if (event.detail) {
                const mode = event.detail.mode;
                try {
                    this.setMode(mode);
                } catch(err) {
                    this.fail(err);
                }
                if (event.detail.callback && typeof event.detail.callback == "function") {
                    event.detail.callback();
                }
            }
        }.bind(this))
    }

    fail(error) {
        document.dispatchEvent(
            new CustomEvent("error", {
                detail: {
                    error,
                } 
            })
        )
    }

    isModeSuported(mode) {
        return this.screens.hasOwnProperty(mode);

    }
    get screen() {
        return this.screens[this.currentMode];
    }

    setMode(mode) {
        if(!this.isModeSuported(mode)) throw new Error("Not suported mode : " + mode);
        Object.values(this.screens).forEach(function(screen) {
            screen.off();
            screen.show("hide");
        })
        this.currentMode = mode;
        this.screen.show("show");
    }

    start() {
        this.screen.start();
    }

    off() {
        this.screen.off();
    }

    
}
