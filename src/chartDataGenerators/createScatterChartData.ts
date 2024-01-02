import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';

export function createScatterChartData(dataSets: IDataSet[]): { datasets: IDataSet[] } {
  return {
    datasets: dataSets.map(dataset => {
      // Фильтрация и преобразование данных
      const scatterData = dataset.data
        .filter(entry => entry.x !== null && entry.y !== null) // Exclude null values
        .filter(entry => entry.x !== 0 || entry.y !== 0) // Exclude (0, 0) values
        .map(entry => ({
          x: parseFloat(entry.x.toString()),
          y: parseFloat(entry.y.toString())
        }));

      // Обновление опций с использованием spread оператора
      return {
        ...dataset, // Копируем все существующие свойства из dataset
        data: scatterData, // Обновляем данные
      };
    })
  };
}
