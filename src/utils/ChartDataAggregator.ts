// src/utils/ChartDataAggregator.ts
import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from '../utils/generateChartData.js';
import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';
import rdpSimplifier from '../filters/rdpSimplifier.js';

export default function ChartDataAggregator(): IDataSet[] {
    const section1: IPoint[] = generatePolyline();
    const section2: IPoint[] = rdpSimplifier(section1, 0.25);
    // Добавляйте дополнительные секции здесь
    // ...
  
    return visualDatasetBuilder(section1, section2);
}
