class Demo {
	crossCall(){
		console.log(this.multiply(5));
	}

	accessBoth(){
		console.log('hello '+this.someString.repeat(this.someNumber));
		console.log(this.someNumber);
	}

	constructor(n:number,s:string){
		this.someNumber=n;
		this.someString=s;
	}

	multiply(x:number){
		return x*this.someNumber;
	}

	greet(){
		console.log("hello "+this.someString);
	}
	someNumber:number;
	someString:string;


}
