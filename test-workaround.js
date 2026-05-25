import { employeeService } from './app/lib/services/employeeService.js';
console.log("Testing...");
employeeService.getById(1).then(console.log).catch(console.error);
