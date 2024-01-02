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
import chaikinsSmoothingFilter from '../filters/chaikinsSmoothingFilter.js';
import { IPoint } from '../interfaces/IPoint';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import sortAndRemoveDuplicates from '../filters/sortAndRemoveDuplicates.js';
import splineFilterAsync from '../filters/asyncSpline.js';
import splineFilterAsync10000 from '../filters/asyncSpline10000.js';
import windowedLeastSquaresFilter from '../filters/windowedLeastSquaresFilter.js';
import leastSquaresWeightedFilter from '../filters/leastSquaresWeightedFilter.js';

export default async function ChartDataAggregator(csvpoints: IPoint[]): Promise<IDataSet[]> {

    const sections = [];   
    const orderByXPoints = orderByXFilter(csvpoints); 
    const rangedPoints = filterXRange(orderByXPoints, 70, 73
        );
    // const originalPoints = generatePolyline();
    const splinePoints = (splineFilter(rangedPoints));
    const cubicSpline = await splineFilterAsync(sortAndRemoveDuplicates(rangedPoints));
    const cubicSpline10000 = await splineFilterAsync10000(sortAndRemoveDuplicates(rangedPoints));

    // Окна 1 м 
    const windowsLSFPoints = windowedLeastSquaresFilter(sortAndRemoveDuplicates(rangedPoints));
    
    // const chaikinsSmoothingFilterPoints = chaikinsSmoothingFilter(originalPoints, 5);
    const enhancedSegmentApproximationPoints = enhancedSegmentApproximation((cubicSpline), 0.05);
    // const shiftpoints = measureDistancesToPolyline(enhancedSegmentApproximationPoints, csvpoints)
    const splitAndMergePoints = splitAndMergeFilter(cubicSpline, 1); 
    const linearAppr = leastSquaresFilter(rangedPoints);
    
    sections.push({ label: "ТЛО",      points: rangedPoints, showLine:false, backgroundColor: 'grey'});
    sections.push({ label: "Сглаж ТЛО",      points: cubicSpline, showLine:false, backgroundColor: 'green'});
    sections.push({ label: "windowsLSFPoints ТЛО",      points: windowsLSFPoints, showLine:true, fill: false, backgroundColor: 'yellow'});
    // sections.push({ label: "Сорт ТЛО",      points: (sortAndRemoveDuplicates(rangedPoints)), showLine:false, backgroundColor: 'green'});
    
    sections.push({ label: "enhanced", points: enhancedSegmentApproximationPoints, showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
    sections.push({ label: "LeastSQR", points: linearAppr, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
    sections.push({ label: "LeastWeightSQR", points: leastSquaresWeightedFilter(rangedPoints), showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
 
    // sections.push({ label: "RDP", points: rdpSimplifier(sortAndRemoveDuplicates(rangedPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
 
    
    const labeledDataSets = sections.map(section => {
        return {
            data: section.points,
                ...section,
                label: `${section.label} - ${section.points.length}`
        };
    });

    return visualDatasetBuilder(...labeledDataSets);

}
