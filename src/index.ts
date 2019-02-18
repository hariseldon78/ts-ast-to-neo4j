import {ClassDeclaration, Project} from 'ts-morph';
import v1 from 'neo4j-driver';

const project = new Project();
const file=process.argv[2];
if (!file){
	console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
}

process.argv.slice(2).forEach(file=>project.addExistingSourceFileIfExists(file));

const classes=project.getSourceFiles().flatMap(sourceFile=>sourceFile.getClasses());
classes.forEach((c:ClassDeclaration)=>{
	const className=c.getName();
	console.log('class name:',className);
	c.forEachChild(child=>{
		console.log(child.getKindName());
	});
});
