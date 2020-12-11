const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const glob = require("glob");
const _ = require("lodash");
const fs = require("fs");

function getEntriesJs() {
  return fs
    .readdirSync("./src/pug")
    .filter((file) => file.match(/.*\.js$/))
    .map((file) => {
      return {
        name: file.substring(0, file.length - 3),
        path: "./pages/" + file,
      };
    })
    .reduce((memo, file) => {
      memo[file.name] = file.path;
      return memo;
    }, {});
}

// Not Bundle html
let templates = [];
let dir = "src/pug";
let files = fs.readdirSync(dir);

files.forEach((file) => {
  if (file.match(/\.pug$/) && file.substring(0, 1) !== "_") {
    let filename = file.substring(0, file.length - 4);
    templates.push(
      new HtmlWebpackPlugin({
        template: dir + "/" + filename + ".pug",
        filename: filename + ".html",
      })
    );
  }
});
// Not bundle html

module.exports = {
  entry: Object.assign(
    {},
    _.reduce(
      glob.sync("./src/**/*.js"),
      (obj, val) => {
        const filenameRegex = /([\w\d_-]*)\.?[^\\\/]*$/i;
        obj[val.match(filenameRegex)[1]] = val;
        return obj;
      },
      {}
    )
    // _.reduce(
    //   glob.sync("./src/**/*.css"),
    //   (obj, val) => {
    //     const filenameRegex = /([\w\d_-]*)\.?[^\\\/]*$/i;
    //     obj[val.match(filenameRegex)[1]] = val;
    //     return obj;
    //   },
    //   {}
    // ),
    // _.reduce(
    //   glob.sync("./src/**/*.scss"),
    //   (obj, val) => {
    //     const filenameRegex = /([\w\d_-]*)\.?[^\\\/]*$/i;
    //     obj[val.match(filenameRegex)[1]] = val;
    //     return obj;
    //   },
    //   {}
    // ),
  ),
  module: {
    rules: [
      {
        test: /\.pug$/i,
        use: ["pug-loader"],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        exclude: /node_modules/,
        use: [
          // *Not bundle styles
          {
            loader: "file-loader",
            options: {
              name: "[name].css",
              // publicPath: (url, resourcePath, context) => {
              //   return path.relative(context, resourcePath).replace("src", "");
              // },
              outputPath: (url, resourcePath, context) => {
                return path
                  .relative(context, resourcePath)
                  .replace("src", "")
                  .replace(/\.(sa|sc|c)ss$/i, ".css");
              },
            },
          },
          "extract-loader",
          // *Not bundle styles

          // *Bundle styles
          // MiniCssExtractPlugin.loader,
          // *Bundle styles
          {
            loader: "css-loader",
            // options: {
            //   sourceMap: true,
            // },
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              publicPath: (url, resourcePath, context) => {
                console.log("url", url);
                console.log("res", resourcePath);
                console.log("context", context);
                // console.log("test:", path.relative(context, resourcePath));
                // console.log(
                //   fs
                //     .readdirSync("./src/assets/images")
                //     // .filter((file) => file.match(/\.(jpe?g|png|gif|svg)$/i))
                // );
                const demo = resourcePath;
                console.log("test1:", JSON.stringify(path.dirname(resourcePath)));
                console.log("test2:", JSON.stringify(path.relative(context, resourcePath)).replace(/\\/, "/"));
                console.log("test3:", path.dirname(resourcePath));
                return path.relative(context, resourcePath).replace("src", "");
              },
              // publicPath: (resourcePath, context) => {
              //   return path.relative(path.dirname(resourcePath), context) + "/";
              // },
              outputPath: (url, resourcePath, context) => {
                return path.relative(context, resourcePath).replace("src", "");
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...templates,
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          // Name
          "gifsicle",
          // Name with options
          ["mozjpeg", { quality: 50 }],
          // Full package name
          [
            "imagemin-svgo",
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
          [
            "pngquant",
            {
              quality: [0.6, 0.8],
            },
          ],
        ],
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/assets/others",
          globOptions: { ignore: ["**.jpg"] },
          to: "./assets/others",
        },
      ],
    }),

    // Bundle styles
    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // all options are optional
    //   filename: "[name].css",
    //   chunkFilename: "[id].css",
    //   ignoreOrder: false, // Enable to remove warnings about conflicting order
    // }),
    // Bundle styles

    // Output an HTML file using the "index.pug" file to generate the template
    // new HtmlWebpackPlugin({
    //   title: "Production",
    //   template: "./src/index.pug",
    //   inject: true,
    // }),
  ],
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: "all",
    },
  },
  output: {
    filename: "[name].bundle.js",
    publicPath: '',
    path: path.resolve(__dirname, "dist"),
  },
};
