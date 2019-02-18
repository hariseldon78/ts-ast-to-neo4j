class Demo {
    constructor(n, s) {
        this.someNumber = n;
        this.someString = s;
    }
    multiply(x) {
        return x * this.someNumber;
    }
    greet() {
        console.log("hello " + this.someString);
    }
    accessBoth() {
        console.log('hello ' + this.someString.repeat(this.someNumber));
        console.log(this.someNumber);
    }
}
//# sourceMappingURL=demo.js.map