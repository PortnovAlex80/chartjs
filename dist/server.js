"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const ChartDataAggregator_1 = __importDefault(require("./utils/ChartDataAggregator"));
const pointFormatter_1 = require("./utils/pointFormatter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const csvFilePath = './data/data.csv';
app.use(express_1.default.static('public'));
app.get('/data', (req, res) => {
    if (fs_1.default.existsSync(csvFilePath) && !process.env.IGNORE_CSV) {
        const fileContent = fs_1.default.readFileSync(csvFilePath, 'utf8');
        if (fileContent.trim()) {
            try {
                const dataSets = fileContent.trim().split('\n\n').map(datasetCsv => {
                    const lines = datasetCsv.trim().split('\n');
                    const colorLine = lines.shift();
                    const color = colorLine && colorLine.startsWith('Color:') ? colorLine.split(':')[1].trim() : 'rgb(0, 0, 0)';
                    const points = lines.map(row => {
                        const [x, y] = row.split(',').map(value => parseFloat(value));
                        return { x, y };
                    });
                    return { data: points, borderColor: color };
                });
                res.json(dataSets);
            }
            catch (error) {
                console.error('Error processing CSV data:', error);
                res.status(500).json({ error: 'Error processing CSV data' });
            }
        }
    }
    else {
        const dataSets = (0, ChartDataAggregator_1.default)();
        writeCsvAndRespond(dataSets, res);
    }
});
function writeCsvAndRespond(dataSets, res) {
    let csvData = '';
    dataSets.forEach(dataset => {
        csvData += `Color: ${dataset.borderColor}\n`;
        const datasetCsv = dataset.data.map(point => {
            const formattedPoint = (0, pointFormatter_1.formatPoint)(point);
            return `${formattedPoint.x},${formattedPoint.y}`;
        }).join('\n');
        csvData += datasetCsv + '\n\n';
    });
    csvData = csvData.trim();
    fs_1.default.writeFile(csvFilePath, csvData, (err) => {
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
    (0, child_process_1.exec)('/usr/bin/chromium --user-data-dir=/home/javascriptstation/Documents/Code/chartsjs/chromium-profile http://localhost:3000', (error, stdout, stderr) => {
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
