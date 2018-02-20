const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: /.js?$/,
			exclude: /node_modules/,
			use:[
				{
					loader: 'babel-loader',
					query: {
						presets: [
							'es2015'
						],
						plugins: [
							'transform-class-properties'
						]
					}
				}
			]
		}]
	},
	plugins: [
		// new webpack.DefinePlugin({
		// 	'process.env': {
		// 		NODE_ENV: JSON.stringify('production')
		// 	}
		// }),
		// new webpack.optimize.UglifyJsPlugin()
	],
	resolve:{
		modules:[
			path.resolve('./src'),
			"node_modules"
		],
		extensions: ['.js', '.json']
	}
};