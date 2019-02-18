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
        console.log(child.getKindName());
    });
});
//# sourceMappingURL=index.js.map