module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    extends: [
        'standard-with-typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    rules: {
        // Deaktiviert veraltete/entfernte Rules aus älteren typescript-eslint Versionen
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/ban-types': 'off',
    },
};