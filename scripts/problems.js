const shell = require('shelljs');
const path = require('path');

const formatters = path.join(path.dirname(require.resolve('libkit')), 'lib', 'vscode');

shell.exec('tsc -p tsconfig.json --noEmit');
shell.exec(`tslint -p . --formatters-dir ${formatters} --format tsc`);
