// server.js
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const port = 3000;
const csvFilePath = './data/data.csv';
const ChartDataAggregator = require('./public/ChartDataAggregator');

app.use(express.static('public'));

app.get('/data', (req, res) => {
  // Проверка наличия и чтение файла
  if (fs.existsSync(csvFilePath)) {
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    if (fileContent.trim()) {
      try {
        // Разделение на датасеты и их обработка
        const dataSets = fileContent.trim().split('\n\n').map(datasetCsv => {
          const lines = datasetCsv.trim().split('\n');
          const colorLine = lines.shift(); // Вытаскиваем строку с цветом

          // Проверка на наличие строки с цветом
          const color = colorLine && colorLine.startsWith('Color:') 
                        ? colorLine.split(':')[1].trim() 
                        : 'rgb(0, 0, 0)'; // Значение по умолчанию для цвета

          // Обработка точек данных
          const points = lines.map(row => {
            const [x, y] = row.split(',').map(value => parseFloat(value));
            return { x, y };
          });

          return { data: points, borderColor: color };
        });

        res.json(dataSets);
      } catch (error) {
        console.error('Ошибка при обработке данных из CSV:', error);
        res.status(500).json({ error: 'Ошибка при обработке данных из CSV' });
      }
    }
  } else {
    const dataSets = ChartDataAggregator();
    writeCsvAndRespond(dataSets, res);
  }
});



function writeCsvAndRespond(dataSets, res) {
  let csvData = '';

  // Проходим по всем датасетам
  dataSets.forEach(dataset => {
    // Добавляем цвет в начало каждого датасета
    csvData += `Color: ${dataset.borderColor}\n`;
    // Добавляем данные точек
    const datasetCsv = dataset.data.map(point => `${point.x},${point.y}`).join('\n');
    csvData += datasetCsv + '\n\n'; // Добавляем разделитель между датасетами
  });

  // Удаляем лишние переводы строк в конце строки
  csvData = csvData.trim();

  fs.writeFile(csvFilePath, csvData, (err) => {
    if (err) {
      console.error('Ошибка записи файла:', err);
      res.status(500).json({ error: 'Ошибка записи файла' });
    } else {
      res.json(dataSets);
    }
  });
}



let browserProcess = null;

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  exec('/usr/bin/chromium --user-data-dir=/home/javascriptstation/Документы/Code/chartsjs/chromium-profile http://localhost:3000', { once: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка при открытии браузера: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Ошибка в стандартном выводе: ${stderr}`);
      return;
    }
    console.log(`Браузер Chromium запущен`);
  });
});

process.on('SIGINT', () => {
  console.log('Получен SIGINT (Ctrl+C), завершение работы сервера...');
  if (browserProcess) {
    console.log('Закрытие браузера...');
    process.kill(browserProcess.pid);
  }
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Получен SIGTERM, завершение работы сервера...');
  if (browserProcess) {
    console.log('Закрытие браузера...');
    process.kill(browserProcess.pid);
  }
  process.exit();
});