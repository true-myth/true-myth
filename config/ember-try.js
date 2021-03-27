'use strict';

module.exports = {
  command: './node_modules/.bin/jest',
  scenarios: [
    {
      name: 'ts-4.0',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.0' },
      },
    },
    {
      name: 'ts-4.1',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.1' },
      },
    },
    {
      name: 'ts-4.2',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.2' },
      },
    },
    {
      name: 'ts-next',
      allowedToFail: true,
      npm: {
        devDependencies: { typescript: 'next' },
      },
    },
  ],
};
