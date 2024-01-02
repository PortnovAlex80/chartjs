// src/script.ts
import { createLineChartData } from './chartDataGenerators/createLineChartData.js';
import { createScatterChartData } from './chartDataGenerators/createScatterChartData.js';
// import { Chart } from 'chart.js';
declare var Chart: any;


async function loadData() {

  console.log("START SCRIpt")
  try {
    const response = await fetch('/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Длина данных ${data.length}`)

    const chartType: string = "scatter"; // 'line'-'scatter'

    let chartData;
    switch (chartType) {
      case "line":
        chartData = createLineChartData(data);
        break;
      case "scatter":
        chartData = createScatterChartData(data);
        break;
      default:
        throw new Error('Неизвестный тип графика');
    }
    
    
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    if (!canvas) {
      throw new Error('Элемент canvas не найден');
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Не удалось получить контекст для canvas');
    }

    new Chart(ctx, {
      type: chartType,
      data: chartData
    });
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

window.addEventListener('load', loadData);
