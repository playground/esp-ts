const path = require('path');
const fs = require('fs');
const dist = 'dist';  // be aware 'dist' folder is also used for tsconfig output

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    //console.log('filter', x, ['.bin'].indexOf(x))
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
  //nodeModules['softap-setup'] = {
  //  commonjs: 'softap-setup',
  //  commonjs2: 'softap-setup',
  //  amd: 'softap-setup',
  //  root: 'softap-setup'
  //}
  console.log(nodeModules)

module.exports = {
  entry: {
    'soil-moisture': `./src/soil-moisture/index.ts`
  },
  output: {
    path: path.resolve(__dirname, dist),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    plugins: [
    ],
    alias: {
      "softap-setup": path.resolve(__dirname, "./node_modules/softap-setup")
    },
    modules: ['node_modules']
  },
  externals: nodeModules,
  mode: 'production',
  target: 'node',
  node: {
    __dirname: true
  }
}
