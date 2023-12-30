// Функция для создания данных для точечного графика
function createScatterChartData(data) {
    return {
      datasets: [
        {
          label: "Geodetic Survey",
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 3,
          data: data.map(entry => ({ x: parseFloat(entry.x), y: parseFloat(entry.y) })),
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: 'rgb(5, 99, 132)',
          pointRadius: 2,
          showLine: false,
        }
      ]
    };
  }
  
  module.exports = createScatterChartData;
  