// Функция для создания данных для точечного графика
function createScatterChartData(dataSets) {
  return {
    datasets: dataSets.map(dataset => {
      // Преобразование данных каждого датасета
      const scatterData = dataset.data.map(entry => {
        return { x: parseFloat(entry.x), y: parseFloat(entry.y) };
      });

      return {
        label: dataset.label,
        borderColor: dataset.borderColor,
        borderWidth: 2,
        data: scatterData,
        pointBackgroundColor: dataset.borderColor,
        pointBorderColor: dataset.borderColor,
        pointRadius: 2,
        fill: false,
        tension: 0, // Для прямых линий между точками
        showLine: true // Добавлено для отображения линии
      };
    })
  };
}

module.exports = createScatterChartData;

