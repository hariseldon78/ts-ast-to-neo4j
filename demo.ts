class Demo {
	someNumber:number;
	someString:string;

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

	squared(){
		return this.someNumber*this.someNumber;
	}

	greet(){
		console.log("hello "+this.someString);
	}

	greetFormally(){
		console.log("Good morning "+this.someString);
	}
}
