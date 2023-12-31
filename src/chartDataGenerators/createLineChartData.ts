// src/chartDataGenerators/createLineChartData.ts
import { IDataSet } from '../interfaces/IDataSet';

export function createLineChartData(dataSets: IDataSet[]): { labels: string[], datasets: IDataSet[] } {
  if (dataSets.length === 0) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: dataSets[0].data.map((_, index) => `${index + 1}`),
    datasets: dataSets
  };
}
