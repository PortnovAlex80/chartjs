// src/utils/ChartDataAggregator.ts
import { generatePolyline } from '../sectiongenerators/polylineGenerator';
import { generateChartData } from '../utils/generateChartData';
import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';

export default function ChartDataAggregator(): IDataSet[] {
    const originalPoints: IPoint[] = generatePolyline();

    // Добавляйте дополнительные секции здесь
    // ...
  
    return generateChartData(originalPoints);
}
