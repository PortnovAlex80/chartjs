// src/utils/ChartDataAggregator.ts
import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from '../utils/generateChartData.js';
import { IDataSet } from '../interfaces/IDataSet';
import { IPoint } from '../interfaces/IPoint';
import rdpSimplifier from '../filters/rdpSimplifier.js';
import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import derivativeFilter from '../filters/derivativeFilter.js';
import averagingFilter from '../filters/averagingFilter.js'

export default function ChartDataAggregator(): IDataSet[] {
    const section1: IPoint[] = generatePolyline();
    const section2: IPoint[] = rdpSimplifier(section1, 0.25);
    const section3: IPoint[] = leastSquaresFilter(section1, 0.25);
    const section5: IPoint[] = averagingFilter(section1);
    const section4: IPoint[] = derivativeFilter(section1);


    // Добавляйте дополнительные секции здесь
    // ...
  
    return visualDatasetBuilder(section1);
}
