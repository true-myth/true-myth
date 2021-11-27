'use strict';

module.exports = {
  command: './node_modules/.bin/jest',
  useYarn: true,
  scenarios: [
    {
      name: 'ts-4.2',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.2' },
      },
    },
    {
      name: 'ts-4.3',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.3' },
      },
    },
    {
      name: 'ts-4.4',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.4' },
      },
    },
    {
      name: 'ts-4.5',
      allowedToFail: false,
      npm: {
        devDependencies: { typescript: '4.5' },
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
