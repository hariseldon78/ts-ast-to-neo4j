class Demo {
	someNumber:number;
	someString:string;
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
}
