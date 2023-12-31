// src/utils/ChartDataAggregator.ts
import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from '../utils/generateChartData.js';
import rdpSimplifier from '../filters/rdpSimplifier.js';
import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import derivativeFilter from '../filters/derivativeFilter.js';
import averagingFilter from '../filters/averagingFilter.js';
export default function ChartDataAggregator() {
    const section1 = generatePolyline();
    const section2 = rdpSimplifier(section1, 0.25);
    const section3 = leastSquaresFilter(section1, 0.25);
    const section5 = averagingFilter(section1);
    const section4 = derivativeFilter(section1);
    // Добавляйте дополнительные секции здесь
    // ...
    return visualDatasetBuilder(section1);
}
