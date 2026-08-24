import next from 'eslint-config-next';

// eslint-config-next 16 ships flat config, so it is spread in directly.
const config = [...next, { ignores: ['.next/**', 'node_modules/**'] }];

export default config;
