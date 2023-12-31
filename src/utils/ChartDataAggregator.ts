// src/utils/ChartDataAggregator.ts
import { IDataSet } from '../interfaces/IDataSet';
import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import rdpSimplifier from '../filters/rdpSimplifier.js';
import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import derivativeFilter from '../filters/derivativeFilter.js';
import averagingFilter from '../filters/averagingFilter.js';
import kalmanFilter from '../filters/kalmanFilter.js';
import integralFilter from '../filters/integralFilter.js';
import lineSegmentFilter from '../filters/calculateLinearRegression.js';

export default function ChartDataAggregator(): IDataSet[] {

    const sections = [];    

    const originalPoints = generatePolyline();
    sections.push({ label: "ТЛО", points: originalPoints });
    const averagingPoints = averagingFilter(originalPoints, 2);
    sections.push({ label: "Сглаживание", points: averagingPoints });
    const kalmanPoints = kalmanFilter(originalPoints, 0.001);
    // sections.push( { label: "Kalman", points: kalmanPoints});
    const derivativePoints = derivativeFilter(averagingPoints);
    // sections.push({ label: "Производная по kalman", points: derivativeFilter(kalmanPoints) });
    const integralFilterPoints = integralFilter(kalmanPoints);
    const leastSquaresPoints = leastSquaresFilter(originalPoints);
    sections.push( { label: "leastSquaresPoints", points: leastSquaresPoints});

    
    // sections.push({ label: "Производная", points: derivativeFilter(originalPoints) });
   
    


    const labeledDataSets = sections.map(section => ({
        label: `${section.label} - ${section.points.length}`,
        points: section.points
}));

    return visualDatasetBuilder(...labeledDataSets);

}
