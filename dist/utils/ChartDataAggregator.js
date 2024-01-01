import visualDatasetBuilder from './VisualDatasetBuilder.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';
import orderByXFilter from '../filters/orderByXFilter.js';
export default function ChartDataAggregator(csvpoints) {
    const sections = [];
    const orderByXPoints = orderByXFilter(csvpoints);
    // const originalPoints = generatePolyline();
    // const splinePoints = (splineFilter(csvpoints));
    // const chaikinsSmoothingFilterPoints = chaikinsSmoothingFilter(originalPoints, 5);
    // const least_points = leastSquaresFilter(splinePoints, 1);
    // const distancePoints = measureDistancesToPolyline(least_points, splinePoints);
    // const derivativePoints = splineFilter(derivativeFilter(splineFilter(distancePoints)));
    // const segmentsPoints = segmentAndApproximate(splinePoints, 0.4);
    // const splitAndMergePoints = splitAndMergeFilter(originalPoints, 0.4);
    // const splitAndMergePointsSPlined = splitAndMergeFilter(splinePoints, 0.4);
    const enhancedSegmentApproximationPoints = enhancedSegmentApproximation(orderByXPoints, 0.3);
    // const shiftpoints = measureDistancesToPolyline(enhancedSegmentApproximationPoints, csvpoints)
    sections.push({ label: "ТЛО", points: csvpoints });
    // 
    // sections.push({ label: "LeastSQR", points: least_points });
    // sections.push({ label: "spline", points: splinePoints });
    // sections.push({ label: "chaikins", points: chaikinsSmoothingFilterPoints });
    // // sections.push({ label: "Shifts", points: distancePoints });
    // sections.push({ label: "Derivative", points: derivativePoints });
    // sections.push({ label: "Segments", points: segmentsPoints });
    // sections.push({ label: "Orig", points: splitAndMergePoints });
    // sections.push({ label: "Splined", points: splitAndMergePointsSPlined });
    sections.push({ label: "enhanced", points: enhancedSegmentApproximationPoints });
    const labeledDataSets = sections.map(section => ({
        label: `${section.label} - ${section.points.length}`,
        points: section.points
    }));
    return visualDatasetBuilder(...labeledDataSets);
}
