// // Функция для создания данных для линейного графика
  
function createLineChartData(dataSets) {
  return {
    labels: dataSets[0].data.map((entry, index) => `${index + 1}`),
    datasets: dataSets
  };
}

module.exports = createLineChartData;

