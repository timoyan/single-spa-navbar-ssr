const webpackMerge = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "timo",
    projectName: "navbar",
    webpackConfigEnv,
    argv
  });

  const serverConfig = singleSpaDefaults({
    orgName: "timo",
    projectName: "navbar",
    webpackConfigEnv,
    argv
  });

  defaultConfig.plugins = defaultConfig.plugins.filter(
    p => p.constructor.name !== "CleanWebpackPlugin"
  );
  serverConfig.plugins = serverConfig.plugins.filter(
    p => p.constructor.name !== "CleanWebpackPlugin"
  );

  console.log(defaultConfig.module.rules);

  return webpackConfigEnv.standalone
    ? [
        webpackMerge.smart(defaultConfig, {
          mode: webpackConfigEnv.standalone ? "development" : "production",
          devServer: {
            port: 8080,
            historyApiFallback: true,
            watchContentBase: true,
            open: true
          }
          // plugins: [
          //   new HtmlWebpackPlugin(),
          //   new StandaloneSingleSpaPlugin({
          //     appOrParcelName: "@timo/navbar",
          //     activeWhen: ["/navbar"],
          //     HtmlWebpackPlugin
          //   })
          // ]
        })
      ]
    : [
        webpackMerge.smart(defaultConfig, {
          devServer: {
            port: 8081
          }
        }),
        webpackMerge.smart(serverConfig, {
          target: "node",
          mode: "development",
          entry: path.resolve(process.cwd(), "src/node-entry.js"),
          output: {
            library: "mf",
            libraryTarget: "var",
            filename: "server.mjs"
          },
          externals: defaultConfig.externals.concat(/react-dom\/.+/),
          plugins: [new EsmWebpackPlugin()]
        })
      ];
};
