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
import leastSquaresPolynomialApproximation from '../filters/leastSquaresPolynomialApproximation.js';
import enhancedSplitAndMergeFilter from '../filters/enhancedSplitAndMergeFilter.js';
import recursiveSegmentationEntryPoint from '../filters/recursiveCubicPolynomeSegmentation.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';

export default async function ChartDataAggregator(csvpoints: IPoint[], coordinateA: number, coordinateB: number): Promise<IDataSet[]> {

    const sections = [];   
    const orderByXPoints = orderByXFilter(csvpoints); 
    const rangedPoints = filterXRange(orderByXPoints, coordinateA, coordinateB
        );

    const fineCubePolynomialApproximation = new CubicPolynomialApproximation();
    const approximatedPoints = fineCubePolynomialApproximation.approximate(rangedPoints);
    const finePointsPolynomial = fineCubePolynomialApproximation.fineCubePolynomialApproximation(0.1);
    const extremesFinePoints1 = fineCubePolynomialApproximation.calculateFirstDerivativeGraph(0.1) ;
    const extremesFinePoints2 = fineCubePolynomialApproximation.calculateSecondDerivativeGraph(0.1) ;
    
        // console.log(extremesFinePoints)
    const approximatedWeighted = leastSquaresWeightedFilter(rangedPoints,0.1);
    const approximatedPolynomial = leastSquaresPolynomialApproximation(rangedPoints, 3);

    // const recursiveCubicPolynomeSegmentationPoints = recursiveSegmentationEntryPoint(rangedPoints);
    // console.log(recursiveCubicPolynomeSegmentationPoints);
    // sections.push({ label: "Extremes",      points: extremesFinePoints1, showLine:true, fill: false, backgroundColor: 'red'});
    // sections.push({ label: "Extremes",      points: extremesFinePoints2, showLine:true, fill: false, backgroundColor: 'green'});
    
    sections.push({ label: "finePointsPolynomial",      points: finePointsPolynomial, showLine:true, fill: false, backgroundColor: 'red'});
    sections.push({ label: "ТЛО",      points: rangedPoints, showLine:false, fill: false, backgroundColor: 'grey'});
    // sections.push({ label: "Расширенный метод",      points: enhancedSplitAndMergeFilter(rangedPoints, 0.2), showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
    // sections.push({ label: "Расширенный метод",      points: recursiveCubicPolynomeSegmentationPoints, showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
    // sections.push({ label: "Расширенный метод",      points: finePointsPolynomial, showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
     sections.push({ label: "LeastSQRWeight", points: approximatedWeighted, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
    // sections.push({ label: "LeastPolynom", points: approximatedPolynomial, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
    // sections.push({ label: "enhanced", points: enhancedSegmentApproximation(rangedPoints, 0.1), showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
   
    // console.log(enhancedSplitAndMergeFilter(rangedPoints, 0.5));
 
    
    const labeledDataSets = sections.map(section => {
        return {
            data: section.points,
                ...section,
                label: `${section.label} - ${section.points.length}`
        };
    });

    return visualDatasetBuilder(...labeledDataSets);

}

 // sections.push({ label: "Сглаж ТЛО",      points: cubicSpline, showLine:false, backgroundColor: 'green'});
    // sections.push({ label: "windowsLSFPoints ТЛО",      points: windowsLSFPoints, showLine:true, fill: false, backgroundColor: 'yellow'});
    // sections.push({ label: "Сорт ТЛО",      points: (sortAndRemoveDuplicates(rangedPoints)), showLine:false, backgroundColor: 'green'});
    
    // sections.push({ label: "RDP", points: rdpSimplifier(sortAndRemoveDuplicates(rangedPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });


