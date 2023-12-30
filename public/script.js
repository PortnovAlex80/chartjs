//script.js
var ctx = document.getElementById('myChart').getContext('2d');
const createLineChartData = require('../charts/lineChart');
const createScatterChartData = require('../charts/scatterChart');

async function loadData() {
  try {
    // Отправляем GET-запрос на сервер для получения данных
    const response = await fetch('/data');
    if (!response.ok) {
      throw new Error(`Какая то ошибка от сервера. HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Получаем данные в формате JSON
    console.log({data});
    // Выбор типа графика
    // const chartType = "line", "scatter";
    const chartType = "line";

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

    var chart = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Метры',
            },
          },
          y: {
            beginAtZero: true,
            min: -1,
            max: 1,
          },
        },
      },
    });
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

window.addEventListener('load', loadData);
