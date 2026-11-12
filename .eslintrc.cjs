module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./apps/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    extends: [
        'standard-with-typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/ban-types': 'off',
        // Fastify route handler sind oft async ohne internes await
        '@typescript-eslint/require-await': 'off',
    },
};