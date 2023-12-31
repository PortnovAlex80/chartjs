// src/utils/generateChartData.ts
import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';

function randomContrastColor(): string {
  const hue = Math.floor(Math.random() * 360); // Случайный оттенок от 0 до 359
  return `hsl(${hue}, 100%, 50%)`; // 100% насыщенность и 50% светлость
}

export function generateChartData(...pointsArrays: IPoint[][]): IDataSet[] {
  return pointsArrays.map(points => {
    return {
      label: 'Полилиния',
      data: points.map(point => ({ x: point.x, y: point.y })),
      borderColor: randomContrastColor(),
      borderWidth: 2,
      fill: false,
    };
  });
}
