"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const neo4j_driver_1 = require("neo4j-driver");
main().catch(err => console.log(err));
async function asyncForEach(array, mapper) {
    return Promise.all(array.map(mapper));
}
async function main() {
    const driver = neo4j_driver_1.default.driver('bolt://localhost', neo4j_driver_1.default.auth.basic('neo4j', 'ts-ast-graph'));
    const project = new ts_morph_1.Project();
    const file = process.argv[2];
    if (!file) {
        console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
    }
    process.argv.slice(2).forEach(file => project.addExistingSourceFileIfExists(file));
    const classes = project.getSourceFiles().flatMap(sourceFile => sourceFile.getClasses());
    await asyncForEach(classes, async (c) => {
        const session = driver.session();
        const className = c.getName();
        console.log('class name:', className);
        await session.run('MERGE (c:Class {name:$className}) RETURN c', {
            className,
        });
        let children = [];
        c.forEachChild(child => children.push(child));
        await asyncForEach(children, async (child) => {
            switch (child.getKindName()) {
                case 'PropertyDeclaration':
                    {
                        const propName = child.getName();
                        console.log('property: this.' + propName);
                        await session.run('MATCH (c:Class {name:$className}) ' +
                            'MERGE (c)-[:OWNS]->(p:Property {name:$propName}) ' +
                            'RETURN p', { className, propName });
                    }
                    break;
                case 'MethodDeclaration':
                    {
                        const methodName = child.getName();
                        await session.run('MATCH (c:Class {name:$className}) ' +
                            'MERGE (c)-[:OWNS]->(m:Method {name:$methodName}) ' +
                            'RETURN m', { className, methodName });
                        console.log('method: this.' + methodName);
                        const propertyAccessElements = extractStructure(child, [
                            'PropertyAccessExpression',
                            'ThisKeyword',
                        ]);
                        console.log(propertyAccessElements.map(seq => '    access this.' +
                            seq[0].getName()));
                        await asyncForEach(propertyAccessElements, async (seq) => {
                            const accessedPropName = seq[0].getName();
                            await session.run('MATCH (c:Class {name:$className})-[:OWNS]->(m:Method {name:$methodName}) ' +
                                'MERGE (c)-[:OWNS]->(p {name:$accessedPropName}) ' +
                                'MERGE (m)-[:ACCESS]->(p) ' +
                                'RETURN p', { className, methodName, accessedPropName });
                        });
                    }
                    break;
            }
        });
        await closeSession(session);
    });
    driver.close();
}
async function closeSession(session) {
    return new Promise((resolve, reject) => {
        session.close(resolve);
    });
}
function extractStructure(node, kindStructure) {
    let result = [];
    node.forEachChild(child => {
        if (child.getKindName() === kindStructure[0]) {
            result.push(...extractSubStructures(child, kindStructure.slice(1)).map(nodes => [
                child,
                ...nodes,
            ]));
        }
        result.push(...extractStructure(child, kindStructure));
    });
    return result;
}
function extractSubStructures(node, kindStructure) {
    let result = [];
    node.forEachChild(child => {
        if (child.getKindName() === kindStructure[0]) {
            result.push(...(kindStructure.length > 1
                ? extractSubStructures(child, kindStructure.slice(1))
                : [[]]).map(nodes => [child, ...nodes]));
        }
    });
    return result;
}
//# sourceMappingURL=index.js.map