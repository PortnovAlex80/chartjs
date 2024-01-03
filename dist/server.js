var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/server.ts
import dotenv from 'dotenv';
import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import ChartDataAggregator from './utils/ChartDataAggregator.js';
import { formatPoint } from './utils/pointFormatter.js';
dotenv.config();
const app = express();
const port = 3000;
const csvFilePath = './data/data.csv';
// Define global variables for coordinates A and B
let coordinateA = 0;
let coordinateB = 0;
app.use(express.static('public'));
app.use(express.static('dist'));
app.use(express.json());
console.log("SERVER START...");
// POST маршрут для обновления координат
app.post('/update-coordinates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coordinateA: newCoordinateA, coordinateB: newCoordinateB } = req.body;
    // Проверьте и обновите глобальные переменные координат
    // (Добавьте здесь проверку входящих данных, если это необходимо)
    coordinateA = newCoordinateA;
    coordinateB = newCoordinateB;
    console.log("updates");
    // Ответ клиенту о том, что координаты были обновлены
    res.json({ message: 'Координаты обновлены' });
}));
app.get('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET DATA");
    if (fs.existsSync(csvFilePath)) {
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        if (fileContent.trim()) {
            try {
                const dataSets = [];
                for (const datasetCsv of fileContent.trim().split('\n\n')) {
                    const lines = datasetCsv.trim().split('\n');
                    const colorLine = lines.shift();
                    const color = colorLine && colorLine.startsWith('Color:') ? colorLine.split(':')[1].trim() : 'rgb(0, 0, 0)';
                    const points = lines.map(row => {
                        const [x, y] = row.split(',').map(value => parseFloat(value));
                        return { x, y };
                    });
                    // Обработка точек через ChartDataAggregator и добавление в dataSets
                    const processedDataSets = yield ChartDataAggregator(points, coordinateA, coordinateB);
                    processedDataSets.forEach(ds => dataSets.push(Object.assign({}, ds)));
                }
                console.log('Data successfully loaded from CSV file');
                res.json(dataSets);
            }
            catch (error) {
                console.error('Error processing CSV data:', error);
                res.status(500).json({ error: 'Error processing CSV data' });
            }
        }
    }
    else {
        // Логика для случая отсутствия CSV файла
        // Например, можно вернуть пустой массив или сгенерировать тестовые данные
        res.json([]);
    }
}));
function writeCsvAndRespond(dataSets, res) {
    let csvData = '';
    dataSets.forEach(dataset => {
        csvData += `Color: ${dataset.borderColor}\n`;
        const datasetCsv = dataset.data.map(point => {
            const formattedPoint = formatPoint(point);
            return `${formattedPoint.x},${formattedPoint.y}`;
        }).join('\n');
        csvData += datasetCsv + '\n\n';
    });
    csvData = csvData.trim();
    fs.writeFile(csvFilePath, csvData, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            res.status(500).json({ error: 'Error writing file' });
        }
        else {
            res.json(dataSets);
        }
    });
}
let browserProcess = null;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    exec('/usr/bin/chromium --user-data-dir=./chromium-profile http://localhost:3000', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error launching browser: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Chromium browser launched`);
    });
});
process.on('SIGINT', () => {
    console.log('Received SIGINT (Ctrl+C), shutting down...');
    if (browserProcess) {
        console.log('Closing browser...');
        process.kill(browserProcess.pid);
    }
    process.exit();
});
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');
    if (browserProcess) {
        console.log('Closing browser...');
        process.kill(browserProcess.pid);
    }
    process.exit();
});
