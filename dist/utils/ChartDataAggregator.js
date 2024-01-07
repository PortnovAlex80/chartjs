var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import leastSquaresWeightedFilter from '../filters/leastSquaresWeightedFilter.js';
import leastSquaresPolynomialApproximation from '../filters/leastSquaresPolynomialApproximation.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
import medianFilter from '../filters/medianFilter.js';
// import enhancedMedianFilter from '../filters/newMedianFilter.js';
import enhancedMedianFilter from '../filters/enhancedMedianFilter.js';
import weightedGroundLevelMedianFilter from '../filters/weightedGroundLevelMedianFilter.js';
export default function ChartDataAggregator(csvpoints, coordinateA, coordinateB) {
    return __awaiter(this, void 0, void 0, function* () {
        const sections = [];
        const orderByXPoints = orderByXFilter(csvpoints);
        const rangedPoints = filterXRange(orderByXPoints, coordinateA, coordinateB);
        const weightedGroundLevelMedianFilterPoints = weightedGroundLevelMedianFilter(rangedPoints);
        // console.log(extremesFinePoints)
        const approximatedWeighted = leastSquaresWeightedFilter(rangedPoints, 0.1);
        const approximatedPolynomial = leastSquaresPolynomialApproximation(rangedPoints, 3);
        // const recursiveCubicPolynomeSegmentationPoints = recursiveSegmentationEntryPoint(rangedPoints);
        // console.log(recursiveCubicPolynomeSegmentationPoints);
        const medianFilterPoints = medianFilter(rangedPoints, 1);
        const enhancedMedianFilterPoints = enhancedMedianFilter(rangedPoints);
        console.log(`New media - ${rangedPoints.length}`);
        let newMedianFilterPoints = enhancedMedianFilter(rangedPoints, 5);
        // newMedianFilterPoints = enhancedMedianFilter(newMedianFilterPoints, 5)
        console.log(`New after media - ${newMedianFilterPoints.length}`);
        // Devs graph
        const fineCubePolynomialApproximation = new CubicPolynomialApproximation();
        let clearingPoints = fineCubePolynomialApproximation.cleanPointsFromOutliers(rangedPoints);
        // const approximatedPoints = fineCubePolynomialApproximation.approximate(rangedPoints);
        const loperccc = fineCubePolynomialApproximation.findQualitySegments(newMedianFilterPoints);
        const finePointsPolynomial = fineCubePolynomialApproximation.fineCubePolynomialApproximation(0.1);
        // const extremesFinePoints1 = fineCubePolynomialApproximation.calculateFirstDerivativeGraph(0.1) ;
        // const extremesFinePoints2 = fineCubePolynomialApproximation.calculateSecondDerivativeGraph(0.1) ;
        // sections.push({ label: "Extremes",      points: extremesFinePoints1, showLine:true, fill: false, backgroundColor: 'red'});
        // sections.push({ label: "Extremes",      points: extremesFinePoints2, showLine:true, fill: false, backgroundColor: 'green'});
        // sections.push({ label: "ТЛО new median",      points: newMedianFilterPoints, showLine:false, fill: false, backgroundColor: 'red'});
        sections.push({ label: "weighted", points: weightedGroundLevelMedianFilterPoints, showLine: false, fill: false, backgroundColor: 'red' });
        // sections.push({ label: "ТЛО normalizre and echancedMF",      points: enhancedNormalizer(enhancedMedianFilterPoints), showLine:false, fill: false, backgroundColor: 'blue'});
        // sections.push({ label: "enhancedMedianFilterPoints",      points: enhancedMedianFilterPoints, showLine:false, fill: false, backgroundColor: 'blue'});
        sections.push({ label: "enhanced median", points: enhancedSegmentApproximation((enhancedMedianFilterPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        sections.push({ label: "enhanced weighted", points: enhancedSegmentApproximation((weightedGroundLevelMedianFilterPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'green', backgroundColor: 'green' });
        // sections.push({ label: "finePointsPolynomial",      points: finePointsPolynomial, showLine:true, fill: false, backgroundColor: 'blue'});
        sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, fill: false, backgroundColor: 'grey' });
        // sections.push({ label: "LeastSQRWeight", points: approximatedWeighted, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        // console.log(loperccc);
        //    sections.push({ label: "Best", points: loperccc, showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
        // sections.push({ label: "clean", points: clearingPoints, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        // sections.push({ label: "ТЛО median",      points: medianFilterPoints, showLine:false, fill: false, backgroundColor: 'red'});
        // sections.push({ label: "Расширенный метод",      points: enhancedSplitAndMergeFilter(rangedPoints, 0.2), showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
        // sections.push({ label: "Расширенный метод",      points: recursiveCubicPolynomeSegmentationPoints, showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
        // sections.push({ label: "Расширенный метод",      points: finePointsPolynomial, showLine:true, fill: false, tension: 0, borderColor: 'green',backgroundColor: 'green'});
        // sections.push({ label: "LeastPolynom", points: approximatedPolynomial, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        // console.log(enhancedSplitAndMergeFilter(rangedPoints, 0.5));
        const labeledDataSets = sections.map(section => {
            return Object.assign(Object.assign({ data: section.points }, section), { label: `${section.label} - ${section.points.length}` });
        });
        return visualDatasetBuilder(...labeledDataSets);
    });
}
// sections.push({ label: "Сглаж ТЛО",      points: cubicSpline, showLine:false, backgroundColor: 'green'});
// sections.push({ label: "windowsLSFPoints ТЛО",      points: windowsLSFPoints, showLine:true, fill: false, backgroundColor: 'yellow'});
// sections.push({ label: "Сорт ТЛО",      points: (sortAndRemoveDuplicates(rangedPoints)), showLine:false, backgroundColor: 'green'});
// sections.push({ label: "RDP", points: rdpSimplifier(sortAndRemoveDuplicates(rangedPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
