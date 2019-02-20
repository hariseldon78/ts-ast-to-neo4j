import {
	ClassDeclaration,
	MethodDeclaration,
	Node,
	Project,
	PropertyAccessExpression,
	PropertyDeclaration,
} from 'ts-morph';
import v1 from 'neo4j-driver';

const driver = v1.driver('bolt://localhost', v1.auth.basic('neo4j', 'ts-ast-graph'));
const project = new Project();
const file = process.argv[2];
if (!file) {
	console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
}

process.argv.slice(2).forEach(file => project.addExistingSourceFileIfExists(file));

const classes = project.getSourceFiles().flatMap(sourceFile => sourceFile.getClasses());
classes.forEach(async (c: ClassDeclaration) => {
	const className = c.getName();
	console.log('class name:', className);
	const session = driver.session();
	await session.run('MERGE (c:Class {name:$className}) RETURN c', {className});
	c.forEachChild(async child => {
		switch (child.getKindName()) {
			case 'PropertyDeclaration': {
				const propName = (child as PropertyDeclaration).getName();
				console.log('property: this.' + propName);
				// language=cypher
				await session.run(
					'MATCH (c:Class {name:$className}) ' +
					'MERGE (c)-[:OWNS]->(p:Property {name:$propName}) ' +
					'RETURN p', {className,propName});
			}
				break;
			case 'MethodDeclaration': {
				const methodName = (child as MethodDeclaration).getName();
				await session.run(
					'MATCH (c:Class {name:$className}) ' +
					'MERGE (c)-[:OWNS]->(m:Method {name:$methodName}) ' +
					'RETURN m', {className,methodName});
				console.log('method: this.' + methodName);



				const propertyAccessElements = extractStructure(child, ['PropertyAccessExpression', 'ThisKeyword']);
				console.log(propertyAccessElements.map(seq=>'    access this.'+(seq[0] as PropertyAccessExpression).getName()))
				propertyAccessElements.forEach( async seq=>{
					const accessedPropName=(seq[0] as PropertyAccessExpression).getName()
					await session.run(
						'MATCH (c:Class {name:$className})-[:OWNS]->(m:Method {name:$methodName}) ' +
						'MERGE (c)-[:OWNS]->(p {name:$accessedPropName}) ' +
						'MERGE (m)-[:ACCESS]->(p) ' +
						'RETURN p', {className,methodName,accessedPropName});

				})
			}
				break;
		}
	});
});


function extractStructure(node: Node, kindStructure: string[]): Node[][] {
	let result = [];
	node.forEachChild(child => {
		if (child.getKindName() === kindStructure[0]) {
			result.push(...extractSubStructure(child, kindStructure.slice(1))
				.map(nodes => [child, ...nodes]));
		}
		result.push(...extractStructure(child, kindStructure));
	});
	return result;
}

function extractSubStructure(node: Node, kindStructure: string[]): Node[][] {
	let result = [];
	node.forEachChild(child => {
		if (child.getKindName() === kindStructure[0]) {
			const subSequences = (kindStructure.length > 1) ?
				extractSubStructure(child, kindStructure.slice(1)) :
				[[]];
			result.push(...subSequences
				.map(nodes => [child, ...nodes]));
		}
	});
	return result;
}
