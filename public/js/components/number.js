import Segment from "./segment.js";

class SegmentNumber {
    constructor(selector) {
        this.A = new Segment(selector + " .A", [0, 2, 3, 5, 6, 7, 8, 9]);
        this.B = new Segment(selector + " .B", [0, 1, 2, 3, 4, 7, 8, 9]);
        this.C = new Segment(selector + " .C", [0, 1, 3, 4, 5, 6, 7, 8, 9]);
        this.D = new Segment(selector + " .D", [0, 2, 3, 5, 6, 8, 9]);
        this.E = new Segment(selector + " .E", [0, 2, 6, 8]);
        this.F = new Segment(selector + " .F", [0, 4, 5, 6, 8, 9]);
        this.G = new Segment(selector + " .G", [2, 3, 4, 5, 6, 8, 9]);
    }

    get segments() {
        return [
            this.A,
            this.B,
            this.C,
            this.D,
            this.E,
            this.F,
            this.G
        ]
    }

    show(number) {

        this.segments.forEach(function(item) {
            item.show(number);
        })
    }

    off() {
        this.segments.forEach(function(item) {
            item.off();
        })
    }
}

export default SegmentNumber;