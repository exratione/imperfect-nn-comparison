/**
 * @fileOverview
 * Create sample data and run nearest neighbor searches (or similar) in a
 * variety of different systems.
 *
 * Usage: node nnComparison.js implementation action
 *
 * implementation: ann | mysql
 * action: setup | run
 */

var path = require('path');

// Usage message if there are not enough arguments.
if (process.argv.length < 4) {
  console.error('Usage: node nnComparison implementation action');
  process.exit(1);
}

var implementationName = process.argv[2];
var actionName = process.argv[3];

var implementation;
try {
  implementation = require(path.resolve(__dirname, 'implementation', implementationName));
} catch (e) {
  console.error('No such implementation: ' + implementationName);
  process.exit(1);
}

if (typeof implementation[actionName] !== 'function') {
  console.error('No such action: ' + actionName);
  process.exit(1);
}

implementation[actionName]();
