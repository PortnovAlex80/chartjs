// src/utils/ChartDataAggregator.ts
import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from '../utils/generateChartData.js';
import rdpSimplifier from '../filters/rdpSimplifier.js';
export default function ChartDataAggregator() {
    const section1 = generatePolyline();
    const section2 = rdpSimplifier(section1, 0.25);
    // Добавляйте дополнительные секции здесь
    // ...
    return visualDatasetBuilder(section1, section2);
}
