import { generatePolyline } from '../sectiongenerators/polylineGenerator.js';
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import derivativeFilter from '../filters/derivativeFilter.js';
import averagingFilter from '../filters/averagingFilter.js';
import kalmanFilter from '../filters/kalmanFilter.js';
import integralFilter from '../filters/integralFilter.js';
import { measureDistancesToPolyline } from '../filters/measureDistancesToPolyline.js';
import segmentAndApproximate from '../filters/segmentAndApproximate.js';
export default function ChartDataAggregator() {
    const sections = [];
    const originalPoints = generatePolyline();
    sections.push({ label: "ТЛО", points: originalPoints });
    const averagingPoints = averagingFilter(originalPoints, 2);
    // sections.push({ label: "Сглаживание", points: averagingPoints });
    const kalmanPoints = kalmanFilter(originalPoints, 0.001);
    // sections.push( { label: "Kalman", points: kalmanPoints});
    const derivativePoints = derivativeFilter(averagingPoints);
    // sections.push({ label: "Производная по kalman", points: derivativeFilter(kalmanPoints) });
    const integralFilterPoints = integralFilter(kalmanPoints);
    const leastSquaresPoints = leastSquaresFilter(originalPoints);
    // sections.push( { label: "Наим квадратов", points: leastSquaresPoints});
    const measureDistancesPoints = measureDistancesToPolyline(leastSquaresPoints, originalPoints);
    // sections.push( { label: "Отклонения от апроксим", points: measureDistancesPoints});
    sections.push({ label: "Производная отклонений", points: derivativeFilter(measureDistancesPoints) });
    // sections.push( { label: "Производная отклонений", points: kalmanFilter(derivativeFilter(measureDistancesPoints), 0.2)});
    // sections.push( { label: "Производная отклонений", points: rdpSimplifier(averagingFilter(derivativeFilter(measureDistancesPoints), 1), 0.2)});
    const segmentsPoints = segmentAndApproximate(originalPoints, 0.3);
    sections.push({ label: "сегменты", points: segmentsPoints });
    // sections.push({ label: "Производная", points: derivativeFilter(originalPoints) });
    const labeledDataSets = sections.map(section => ({
        label: `${section.label} - ${section.points.length}`,
        points: section.points
    }));
    return visualDatasetBuilder(...labeledDataSets);
}
