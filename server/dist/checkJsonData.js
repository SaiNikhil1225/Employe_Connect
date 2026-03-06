"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(__dirname, '../../src/data');
function readJsonFile(filename) {
    const filePath = path_1.default.join(dataDir, filename);
    const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
}
const employees = readJsonFile('employees.json');
// Find Emily Chen
const emily = employees.find((e) => e.name === 'Emily Chen');
console.log('Emily Chen from employees.json:');
console.log(JSON.stringify(emily, null, 2));
console.log('\n_id field type:', typeof emily._id);
console.log('_id value:', emily._id);
//# sourceMappingURL=checkJsonData.js.map