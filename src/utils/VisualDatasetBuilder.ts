// src/utils/generateChartData.ts
import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';
import { ILabeledDataSet } from '../interfaces/ILabeledDataSet';

function randomContrastColor(): string {
  const hue = Math.floor(Math.random() * 360); // Случайный оттенок от 0 до 359
  return `hsl(${hue}, 100%, 50%)`; // 100% насыщенность и 50% светлость
}

export default function visualDatasetBuilder(...dataSets: IDataSet[]): IDataSet[] {
  return dataSets.map( dataSets => {
    const borderColor = dataSets.borderColor || randomContrastColor();

    return {
      ...dataSets,
      options: {
        ...dataSets,
        borderColor: borderColor || randomContrastColor(),
        pointBackgroundColor: borderColor,
        pointBorderColor: randomContrastColor()        
      }
    }
});
}