"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const project = new ts_morph_1.Project();
const file = process.argv[2];
if (!file) {
    console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
}
process.argv.slice(2).forEach(file => project.addExistingSourceFileIfExists(file));
const classes = project.getSourceFiles().flatMap(sourceFile => sourceFile.getClasses());
classes.forEach((c) => {
    const className = c.getName();
    console.log('class name:', className);
    c.forEachChild(child => {
        // console.log(child.getKindName());
        switch (child.getKindName()) {
            case 'PropertyDeclaration':
                console.log('property: this.' + child.getName());
                break;
            case 'MethodDeclaration':
                console.log('method: this.' + child.getName());
                const propertyAccessElements = extractStructure(child, ['PropertyAccessExpression', 'ThisKeyword']);
                console.log(propertyAccessElements.map(seq => seq.map(node => node.getKindName()).join('=>')));
                break;
        }
    });
});
function extractStructure(node, kindStructure) {
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
function extractSubStructure(node, kindStructure) {
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
//# sourceMappingURL=index.js.map