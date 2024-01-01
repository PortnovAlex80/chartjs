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
import { measureDistancesToPolyline } from '../filters/measureDistancesToPolyline.js';
import  segmentAndApproximate  from '../filters/segmentAndApproximate.js';
import splineFilter from '../filters/SplineFilter.js';
import splitAndMergeFilter from '../filters/splitAndMergeFilter.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';

export default function ChartDataAggregator(): IDataSet[] {

    const sections = [];    

    const originalPoints = generatePolyline();
    const splinePoints = (splineFilter(originalPoints));
    const least_points = leastSquaresFilter(splinePoints, 1);
    const distancePoints = measureDistancesToPolyline(least_points, splinePoints);
    const derivativePoints = splineFilter(derivativeFilter(splineFilter(distancePoints)));
    const segmentsPoints = segmentAndApproximate(splinePoints, 0.4);
    const splitAndMergePoints = splitAndMergeFilter(originalPoints, 0.4);
    const splitAndMergePointsSPlined = splitAndMergeFilter(splinePoints, 0.4);
    const enhancedSegmentApproximationPoints = enhancedSegmentApproximation(originalPoints, 0.5);
    
    

    // sections.push({ label: "ТЛО", points: originalPoints });

    // sections.push({ label: "LeastSQR", points: least_points });
    // sections.push({ label: "spline", points: splinePoints });
    // // sections.push({ label: "Shifts", points: distancePoints });
    // sections.push({ label: "Derivative", points: derivativePoints });
    // sections.push({ label: "Segments", points: segmentsPoints });
    sections.push({ label: "Orig", points: splitAndMergePoints });
    // sections.push({ label: "Splined", points: splitAndMergePointsSPlined });
    sections.push({ label: "enhanced", points: enhancedSegmentApproximationPoints });
    
    
    

    

    
    // sections.push({ label: "ТЛО", points: originalPoints });
    
    

    
    



    // const segmentsPoints = segmentAndApproximate(originalPoints, 0.3);
    // sections.push( { label: "сегменты", points: segmentsPoints});


    
    // sections.push({ label: "Производная", points: derivativeFilter(originalPoints) });
   
    


    const labeledDataSets = sections.map(section => ({
        label: `${section.label} - ${section.points.length}`,
        points: section.points
}));

    return visualDatasetBuilder(...labeledDataSets);

}
