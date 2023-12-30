// Функция для создания данных для линейного графика
function createLineChartData(data) {
    return {
      labels: data.map((entry, index) => `${index + 1}`),
      datasets: [
        {
          label: "График данных",
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 3,
          data: data.map(entry => parseFloat(entry.y)),
          fill: false,
        }
      ]
    };
  }
  
  module.exports = createLineChartData;
  