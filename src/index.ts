import {
	ClassDeclaration,
	MethodDeclaration,
	Node,
	Project,
	PropertyAccessExpression,
	PropertyDeclaration,
} from 'ts-morph';

const project = new Project();
const file = process.argv[2];
if (!file) {
	console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
}

process.argv.slice(2).forEach(file => project.addExistingSourceFileIfExists(file));

const classes = project.getSourceFiles().flatMap(sourceFile => sourceFile.getClasses());
classes.forEach((c: ClassDeclaration) => {
	const className = c.getName();
	console.log('class name:', className);
	c.forEachChild(child => {
		// console.log(child.getKindName());
		switch (child.getKindName()) {
			case 'PropertyDeclaration':
				console.log('property: this.' + (child as PropertyDeclaration).getName());
				break;
			case 'MethodDeclaration':
				console.log('method: this.' + (child as MethodDeclaration).getName());
				const propertyAccessElements = extractStructure(child, ['PropertyAccessExpression','ThisKeyword']);
				console.log(propertyAccessElements.map(seq=>seq.map(node=>node.getKindName()).join('=>')));
				break;
		}
	});
});


function extractStructure(node: Node, kindStructure: string[], allowDeeper = true): Node[][] {
	let result = [];
	node.forEachChild(child => {
		const kindName = child.getKindName();
		const searchedKind = kindStructure[0];
		if (kindName === searchedKind) {
			const subSequences = (kindStructure.length > 1) ?
				extractStructure(child, kindStructure.slice(1), false) :
				[[]];
			result.push(...subSequences
				.map(nodes => [child, ...nodes]));
		} else if (allowDeeper) {
			result.push(...extractStructure(child, kindStructure, allowDeeper));
		}
	});
	return result.filter(sequence=>sequence.length===kindStructure.length);
}
