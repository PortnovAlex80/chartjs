// src/server.ts
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { ExecException, exec } from 'child_process';
import fs from 'fs';
import { IDataSet } from './interfaces/IDataSet';
import { IPoint } from './interfaces/IPoint'
import ChartDataAggregator from './utils/ChartDataAggregator.js';
import { formatPoint } from './utils/pointFormatter.js';

dotenv.config();
const app = express();
const port = 3000;
const csvFilePath = './data/data.csv';

app.use(express.static('public'));
app.use(express.static('dist'));


console.log("SERVER START...")

app.get('/data', (req: Request, res: Response) => {
  console.log("GET DATA");

    if (fs.existsSync(csvFilePath) && !process.env.IGNORE_CSV) {
      const fileContent = fs.readFileSync(csvFilePath, 'utf8');
      if (fileContent.trim()) {
        try {
          const dataSets: IDataSet[] = fileContent.trim().split('\n\n').map(datasetCsv => {
            const lines = datasetCsv.trim().split('\n');
            const colorLine = lines.shift();
            const color = colorLine && colorLine.startsWith('Color:') ? colorLine.split(':')[1].trim() : 'rgb(0, 0, 0)';
  
            const points: IPoint[] = lines.map(row => {
              const [x, y] = row.split(',').map(value => parseFloat(value));
              return { x, y };
            });
  
            return { data: points, borderColor: color };
          });
  
          res.json(dataSets);
        } catch (error) {
          console.error('Error processing CSV data:', error);
          res.status(500).json({ error: 'Error processing CSV data' });
        }
      }
    } else {
      const dataSets = ChartDataAggregator();
      writeCsvAndRespond(dataSets, res);
    }
  });
  
  function writeCsvAndRespond(dataSets: IDataSet[], res: Response) {
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
      } else {
        res.json(dataSets);
      }
    });
  }
  

let browserProcess: any = null;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  exec('/usr/bin/chromium --user-data-dir=./chromium-profile http://localhost:3000', (error: ExecException | null, stdout: string, stderr: string) => {
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
