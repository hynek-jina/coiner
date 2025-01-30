const webpack = require("webpack");
const path = require("path");

module.exports = {
  jest: {
    configure: {
      watchman: false,
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        zlib: require.resolve("browserify-zlib"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"),
        net: false,
        tls: false,
        url: require.resolve("url/"),
        assert: require.resolve("assert/"),
        util: require.resolve("util/"),
        process: require.resolve("process/browser"),
        buffer: require.resolve("buffer/"),
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@components": path.resolve(__dirname, "src/components"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@state": path.resolve(__dirname, "src/state"),
      };

      return webpackConfig;
    },
  },
};
