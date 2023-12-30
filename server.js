const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const port = 3000;
const csvFilePath = './data/data.csv';
// const generatePoints = require('./geodetic/geodetic');
const generatePoints = require('./geodetic/polylineErrorGenerator');


app.use(express.static('public'));

app.get('/data', (req, res) => {
  if (fs.existsSync(csvFilePath)) {
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    if (fileContent.trim()) {
      try {
        const rows = fileContent.split('\n').map((row) => {
          const [x, y] = row.split(',').map(value => parseFloat(value));
          if (isNaN(x) || isNaN(y)) {
            throw new Error('Невозможно преобразовать данные из CSV в числа');
          }
          return {
            x: x.toFixed(3),
            y: y.toFixed(3),
          };
        });

        res.json(rows);
      } catch (error) {
        console.error('Ошибка при обработке данных из CSV:', error);
        res.status(500).json({ error: 'Ошибка при обработке данных из CSV' });
      }
    } else {
      const generatedPoints = generatePoints();
      writeCsvAndRespond(generatedPoints, res);
    }
  } else {
    const generatedPoints = generatePoints();
    writeCsvAndRespond(generatedPoints, res);
  }
});



function writeCsvAndRespond(generatedPoints, res) {
  const csvData = generatedPoints.map((point) => `${point.x},${point.y}`).join('\n');
  fs.writeFile(csvFilePath, csvData, (err) => {
    if (err) {
      res.status(500).json({ error: 'Ошибка записи файла' });
    } else {
      res.json(generatedPoints);
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