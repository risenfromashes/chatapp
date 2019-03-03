module.exports = {
  mode: "production",
  performance: {
    hints: false
  },
  entry: {
    app: "./src/client/index.tsx",
    login: "./src/client/login.tsx"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist/public/js/")
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        //exclude: [/\.js$/, /\.html$/, /\.json$/, /\.ejs$/],
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BROWSER': JSON.stringify(true)
    })
  ]
};