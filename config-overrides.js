const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        'process/browser': require.resolve('process/browser'),
        // buffer: require.resolve('buffer/'),
        vm: require.resolve('vm-browserify'),
        crypto: require.resolve('crypto-browserify'), // can be polyfilled here if needed
        stream: require.resolve('stream-browserify'), // can be polyfilled here if needed
        assert: require.resolve('assert'), // can be polyfilled here if needed
        http: require.resolve('stream-http'), // can be polyfilled here if needed
        https: require.resolve('https-browserify'), // can be polyfilled here if needed
        os: require.resolve('os-browserify'), // can be polyfilled here if needed
        url: require.resolve('url'), // can be polyfilled here if needed
        // zlib: false, // require.resolve("browserify-zlib") can be polyfilled here if needed
        path: require.resolve('path-browserify'),
        constants: require.resolve('constants-browserify'),
        fs: require.resolve('memfs'),
        worker_threads: false,
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    config.ignoreWarnings = [/Failed to parse source map/];
    config.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
            fullySpecified: false,
        },
    });
    return config;
};
