// webpack.config.js
module.exports = {
    entry: './public/script.js', // Путь к вашему скрипту
    output: {
      filename: 'bundle.js', // Имя выходного файла
      path: __dirname + '/public/dist', // Папка для выходных файлов
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  };
  