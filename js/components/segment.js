class Segment {
    constructor(selector, numbersList) {
        this.element = document.querySelector(selector);
        this.element.classList.add("off");
        this.numbersList = numbersList;
    }

    show(number) {
        this.off();
        if (this.numbersList.includes(number)) {
            this.element.classList.remove("off");
        }
    }
    off() {
        this.element.classList.add("off");
    }
}

export default Segment;