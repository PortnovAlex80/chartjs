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
import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import splineFilter from '../filters/SplineFilter.js';
import splitAndMergeFilter from '../filters/splitAndMergeFilter.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import sortAndRemoveDuplicates from '../filters/sortAndRemoveDuplicates.js';
import splineFilterAsync from '../filters/asyncSpline.js';
import splineFilterAsync10000 from '../filters/asyncSpline10000.js';
import windowedLeastSquaresFilter from '../filters/windowedLeastSquaresFilter.js';
import leastSquaresWeightedFilter from '../filters/leastSquaresWeightedFilter.js';
export default function ChartDataAggregator(csvpoints) {
    return __awaiter(this, void 0, void 0, function* () {
        const sections = [];
        const orderByXPoints = orderByXFilter(csvpoints);
        const rangedPoints = filterXRange(orderByXPoints, 70, 73);
        // const originalPoints = generatePolyline();
        const splinePoints = (splineFilter(rangedPoints));
        const cubicSpline = yield splineFilterAsync(sortAndRemoveDuplicates(rangedPoints));
        const cubicSpline10000 = yield splineFilterAsync10000(sortAndRemoveDuplicates(rangedPoints));
        // Окна 1 м 
        const windowsLSFPoints = windowedLeastSquaresFilter(sortAndRemoveDuplicates(rangedPoints));
        // const chaikinsSmoothingFilterPoints = chaikinsSmoothingFilter(originalPoints, 5);
        const enhancedSegmentApproximationPoints = enhancedSegmentApproximation((cubicSpline), 0.05);
        // const shiftpoints = measureDistancesToPolyline(enhancedSegmentApproximationPoints, csvpoints)
        const splitAndMergePoints = splitAndMergeFilter(cubicSpline, 1);
        const linearAppr = leastSquaresFilter(rangedPoints);
        sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, backgroundColor: 'grey' });
        sections.push({ label: "Сглаж ТЛО", points: cubicSpline, showLine: false, backgroundColor: 'green' });
        sections.push({ label: "windowsLSFPoints ТЛО", points: windowsLSFPoints, showLine: true, fill: false, backgroundColor: 'yellow' });
        // sections.push({ label: "Сорт ТЛО",      points: (sortAndRemoveDuplicates(rangedPoints)), showLine:false, backgroundColor: 'green'});
        sections.push({ label: "enhanced", points: enhancedSegmentApproximationPoints, showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
        sections.push({ label: "LeastSQR", points: linearAppr, showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        sections.push({ label: "LeastWeightSQR", points: leastSquaresWeightedFilter(rangedPoints), showLine: true, tension: 0, fill: false, borderColor: 'blue', backgroundColor: 'blue' });
        // sections.push({ label: "RDP", points: rdpSimplifier(sortAndRemoveDuplicates(rangedPoints), 0.1), showLine: true, tension: 0, fill: false, borderColor: 'red', backgroundColor: 'red' });
        const labeledDataSets = sections.map(section => {
            return Object.assign(Object.assign({ data: section.points }, section), { label: `${section.label} - ${section.points.length}` });
        });
        return visualDatasetBuilder(...labeledDataSets);
    });
}
