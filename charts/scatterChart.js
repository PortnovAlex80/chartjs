// Функция для создания данных для точечного графика
function createScatterChartData(dataSets) {
  // Логирование входных данных
  console.log("Данные, поступившие в createScatterChartData:", dataSets);

  return {
    datasets: dataSets.map(dataset => {
      // Преобразование данных каждого датасета
      const scatterData = dataset.data.map(entry => {
        console.log("Обрабатываемая точка:", entry); // Логирование каждой точки
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
        showLine: true // Добавлено для отображения линии
      };
    })
  };
}

module.exports = createScatterChartData;

