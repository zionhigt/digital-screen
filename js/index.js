import { Screen } from "./lib/mode_manager.js";

let isOn = false;

document.addEventListener("error", function(event) {
    if (event?.detail?.error) {
        console.error(event.detail.error);
    }
});
document.querySelector(".oof-button #oofCursor")
.addEventListener("change", function(event) {
    isOn = event.target.checked;
    refresh();
})

document.querySelectorAll('input[name="mode"]')
.forEach(function(item) {
    item.addEventListener("change", function(event) {
        console.log(event.target.checked)
        if (event.target.checked) {
            const ev = new CustomEvent("mode:set", {
                detail: {
                    mode: event.target.value,
                    callback: function() {
                        refresh();
                    }
                }
            })
            document.dispatchEvent(ev);
        }
    })
})

const screen = new Screen();

const refresh = function() {
    if (isOn) {
        screen.start();
    } else {
        screen.off();
    }   
}

