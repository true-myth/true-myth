'use strict';

module.exports = {
  command: './node_modules/.bin/jest',
  scenarios: [
    {
      name: 'ts-3.6',
      npm: {
        devDependencies: { typescript: '3.6' },
      },
    },
    {
      name: 'ts-3.7',
      npm: {
        devDependencies: { typescript: '3.7' },
      },
    },
    {
      name: 'ts-3.8',
      allowedToFail: true,
      npm: {
        devDependencies: { typescript: '3.8' },
      },
    },
    {
      name: 'ts-3.9',
      allowedToFail: true,
      npm: {
        devDependencies: { typescript: '3.9' },
      },
    },
    {
      name: 'ts-4.0',
      allowedToFail: true,
      npm: {
        devDependencies: { typescript: '4.0' },
      },
    },
    {
      name: 'ts-4.1',
      allowedToFail: true,
      npm: {
        devDependencies: { typescript: '4.1' },
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
