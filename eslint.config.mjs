import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        files: ['**/*.test.js', 'test/**/*.js'],
        languageOptions: {
            globals: { describe: 'readonly', it: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' },
        },
    },
    {
        ignores: ['.dev-server/**', '.vscode/**', '*.config.mjs', 'admin/admin.d.ts'],
    },
];
