"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ts_morph_1 = require("ts-morph");
var neo4j_driver_1 = require("neo4j-driver");
main()["catch"](function (err) { return console.log(err); });
function asyncForEach(array, mapper) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all(array.map(mapper))];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var driver, project, file, classes;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    driver = neo4j_driver_1["default"].driver('bolt://localhost:7687', neo4j_driver_1["default"].auth.basic('neo4j', 'ts-ast-graph'));
                    return [4 /*yield*/, driver.verifyConnectivity()];
                case 1:
                    _a.sent();
                    project = new ts_morph_1.Project();
                    file = process.argv[2];
                    if (!file) {
                        console.error('you need to pass the typescript source file names as arguments, p.e.: npm start -- /path/file.ts');
                    }
                    process.argv.slice(2).forEach(function (file) { return project.addExistingSourceFileIfExists(file); });
                    classes = project.getSourceFiles().flatMap(function (sourceFile) { return sourceFile.getClasses(); });
                    return [4 /*yield*/, asyncForEach(classes, function (c) { return __awaiter(_this, void 0, void 0, function () {
                            var session, className, children;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        session = driver.session();
                                        className = c.getName();
                                        console.log('class name:', className);
                                        return [4 /*yield*/, runSession(driver, 'MERGE (c:Class {name:$className}) RETURN c', {
                                                className: className
                                            })];
                                    case 1:
                                        _a.sent();
                                        children = [];
                                        c.forEachChild(function (child) { return children.push(child); });
                                        return [4 /*yield*/, asyncForEach(children, function (child) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a, propName, methodName_1, propertyAccessElements;
                                                var _this = this;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            _a = child.getKindName();
                                                            switch (_a) {
                                                                case 'PropertyDeclaration': return [3 /*break*/, 1];
                                                                case 'MethodDeclaration': return [3 /*break*/, 3];
                                                            }
                                                            return [3 /*break*/, 6];
                                                        case 1:
                                                            propName = child.getName();
                                                            console.log('property: this.' + propName);
                                                            return [4 /*yield*/, runSession(driver, 'MATCH (c:Class {name:$className}) ' +
                                                                    'MERGE (c)-[:OWNS]->(p:Property {name:$propName}) ' +
                                                                    'RETURN p', { className: className, propName: propName })];
                                                        case 2:
                                                            _b.sent();
                                                            return [3 /*break*/, 6];
                                                        case 3:
                                                            methodName_1 = child.getName();
                                                            return [4 /*yield*/, runSession(driver, 'MATCH (c:Class {name:$className}) ' +
                                                                    'MERGE (c)-[:OWNS]->(m:Method {name:$methodName}) ' +
                                                                    'RETURN m', { className: className, methodName: methodName_1 })];
                                                        case 4:
                                                            _b.sent();
                                                            console.log('method: this.' + methodName_1);
                                                            propertyAccessElements = extractStructure(child, [
                                                                'PropertyAccessExpression',
                                                                'ThisKeyword',
                                                            ]);
                                                            console.log(propertyAccessElements.map(function (seq) {
                                                                return '    access this.' +
                                                                    seq[0].getName();
                                                            }));
                                                            return [4 /*yield*/, asyncForEach(propertyAccessElements, function (seq) { return __awaiter(_this, void 0, void 0, function () {
                                                                    var accessedPropName;
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0:
                                                                                accessedPropName = seq[0].getName();
                                                                                return [4 /*yield*/, runSession(driver, 'MATCH (c:Class {name:$className})-[:OWNS]->(m:Method {name:$methodName}) ' +
                                                                                        'MERGE (c)-[:OWNS]->(p {name:$accessedPropName}) ' +
                                                                                        'MERGE (m)-[:ACCESS]->(p) ' +
                                                                                        'RETURN p', { className: className, methodName: methodName_1, accessedPropName: accessedPropName })];
                                                                            case 1:
                                                                                _a.sent();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); })];
                                                        case 5:
                                                            _b.sent();
                                                            return [3 /*break*/, 6];
                                                        case 6: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, findCommunities(driver)];
                case 3:
                    _a.sent();
                    driver.close();
                    return [2 /*return*/];
            }
        });
    });
}
function runSession(driver) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = driver.session();
                    return [4 /*yield*/, session.run.apply(session, args)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, session.close()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function extractStructure(node, kindStructure) {
    var result = [];
    node.forEachChild(function (child) {
        if (child.getKindName() === kindStructure[0]) {
            result.push.apply(result, extractSubStructures(child, kindStructure.slice(1)).map(function (nodes) { return [
                child
            ].concat(nodes); }));
        }
        result.push.apply(result, extractStructure(child, kindStructure));
    });
    return result;
}
function extractSubStructures(node, kindStructure) {
    var result = [];
    node.forEachChild(function (child) {
        if (child.getKindName() === kindStructure[0]) {
            result.push.apply(result, (kindStructure.length > 1
                ? extractSubStructures(child, kindStructure.slice(1))
                : [[]]).map(function (nodes) { return [child].concat(nodes); }));
        }
    });
    return result;
}
function findCommunities(driver) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runSession(driver, "call gds.louvain.write({nodeProjection: ['Method', 'Property'],relationshipProjection: {  TYPE: { type: 'ACCESS', orientation: 'undirected', aggregation: 'NONE' } }, writeProperty:'community'}) yield communityCount,createMillis,computeMillis,writeMillis")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, runSession(driver, 'match (m),(n) where m.community=n.community and m.name<>n.name merge (m)-[:FRIEND]-(n)')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
