import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import leastSquaresWeightedFilter from '../filters/leastSquaresWeightedFilter.js';
import leastSquaresPolynomialApproximation from '../filters/leastSquaresPolynomialApproximation.js';

const enhancedSplitAndMergeFilter: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    let split_cnt = 0;
    const MAX_LOG_COUNT = 10; // Максимальное количество логов

    function isLogging() {
    return split_cnt < MAX_LOG_COUNT;
    }

    if (points.length < 2) {
        return points;
    }

    function calculateRMSEForSegment(segment: IPoint[]): { rmseWeighted: number; rmsePolynomial: number } {
        const approximatedWeighted = leastSquaresWeightedFilter(segment);
        const approximatedPolynomial = leastSquaresPolynomialApproximation(segment, 3);
    
        // Приведение обоих аппроксимаций к одинаковому количеству точек
        const expandedWeighted = expandSegment(approximatedWeighted, segment.length);
        const expandedPolynomial = expandSegment(approximatedPolynomial, segment.length);
    
        const rmseWeighted = calculateRMSE(segment, expandedWeighted);
        const rmsePolynomial = calculateRMSE(segment, expandedPolynomial);

        const segmentLength = calculateSegmentLength(segment);
        isLogging() && console.log(`Segment length (X-coordinate difference): ${segmentLength}`);
        isLogging() && console.log(`RMSE Weighted: ${rmseWeighted}, RMSE Polynomial: ${rmsePolynomial}`);
    
    
        return { rmseWeighted, rmsePolynomial };
    }
    

    function findFurthestPointIndex(points: IPoint[], start: number, end: number): number {
        let maxDistance = -1;
        let index = start;
        for (let i = start + 1; i < end; i++) {
            let distance = perpendicularDistance(points[start], points[end], points[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                index = i;
            }
        }
        return index;
    }

    function perpendicularDistance(pointA: IPoint, pointB: IPoint, pointC: IPoint): number {
        let area = Math.abs(0.5 * (pointA.x * (pointB.y - pointC.y) + pointB.x * (pointC.y - pointA.y) + pointC.x * (pointA.y - pointB.y)));
        let bottom = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
        return (area / bottom) * 2;
    }

    function canMergeSegments(segment1: IPoint[], segment2: IPoint[], epsilon: number): boolean {
        // ... Код функции canMergeSegments ...
    
        // Расчет RMSE для каждого сегмента и их объединения
        const { rmseWeighted: rmseW1, rmsePolynomial: rmseP1 } = calculateRMSEForSegment(segment1);
        const { rmseWeighted: rmseW2, rmsePolynomial: rmseP2 } = calculateRMSEForSegment(segment2);
        const combinedSegment = segment1.concat(segment2);
        const { rmseWeighted: rmseWCombined, rmsePolynomial: rmsePCombined } = calculateRMSEForSegment(combinedSegment);

        isLogging() && console.log(`Trying to merge segments. Segment lengths: ${segment1.length}, ${segment2.length}`);
        isLogging() && console.log(`RMSE Weighted: ${rmseW1}, ${rmseW2}, Combined: ${rmseWCombined}`);
        isLogging() && console.log(`RMSE Polynomial: ${rmseP1}, ${rmseP2}, Combined: ${rmsePCombined}`);

        
        // Условие слияния на основе RMSE
        return rmseWCombined < epsilon && rmsePCombined < epsilon && Math.abs(rmseW1 - rmseW2) < 0.01 && Math.abs(rmseP1 - rmseP2) < 0.01;
    }

    function expandSegment(segment: IPoint[], targetLength: number): IPoint[] {
        if (segment.length === 2) {
            const [start, end] = segment;
            const points = [];
            for (let t = 0; t <= 1; t += 1 / (targetLength - 1)) {
                points.push({
                    x: start.x * (1 - t) + end.x * t,
                    y: start.y * (1 - t) + end.y * t
                });
            }
            return points;
        }
        return segment;
    }
    

    // function split(points: IPoint[], start: number, end: number): IPoint[] {
    //     let furthestIndex = findFurthestPointIndex(points, start, end);
    //     let segment = points.slice(start, end + 1);
    //     let { rmseWeighted, rmsePolynomial } = calculateRMSEForSegment(segment);

    //     console.log(`Splitting segment at index ${furthestIndex} due to distance or RMSE condition`);

    //     if (perpendicularDistance(points[start], points[end], points[furthestIndex]) > epsilon || (rmseWeighted > 0.1 && rmsePolynomial > 0.1) || Math.abs(rmseWeighted - rmsePolynomial) > 0.01) {
    //         let firstSegment = split(points, start, furthestIndex);
    //         let secondSegment = split(points, furthestIndex, end);

    //                             // Попытка слияния
    //                             if (canMergeSegments(firstSegment, secondSegment, epsilon)) {
    //                                 console.log(`Merging segments at index ${furthestIndex}`);
    //                                 return [...firstSegment.slice(0, -1), secondSegment[secondSegment.length - 1]];
    //                             }
    //         return [...firstSegment, ...secondSegment.slice(1)];
    //     }


    //     console.log(`No split for segment from index ${start} to ${end}`);
    //     return segment;
    // }

    function split(points: IPoint[], start: number, end: number): IPoint[] {
        isLogging() && console.log(`********************** ИТЕРАЦИЯ НОМЕР ${++split_cnt} ***********************`);
        let furthestIndex = findFurthestPointIndex(points, start, end);
        let segment = points.slice(start, end + 1);
        let { rmseWeighted, rmsePolynomial } = calculateRMSEForSegment(segment);
    
        isLogging() && console.log(`Analyzing segment from index ${start} to ${end}`);
        isLogging() && console.log(`Segment length (X-coordinate difference): ${calculateSegmentLength(segment)}`);
        isLogging() && console.log(`RMSE Weighted: ${rmseWeighted}, RMSE Polynomial: ${rmsePolynomial}`);
    
        if (perpendicularDistance(points[start], points[end], points[furthestIndex]) > epsilon || 
            (rmseWeighted > 0.1 && rmsePolynomial > 0.1) || 
            Math.abs(rmseWeighted - rmsePolynomial) > 0.01) {
                
                if (isLogging()) {
                    const perpendicularDist = perpendicularDistance(points[start], points[end], points[furthestIndex]);
                    console.log(`Perpendicular distance for segment at index ${furthestIndex}: ${perpendicularDist}`);
                    console.log(`Splitting conditions: Perpendicular distance > epsilon: ${perpendicularDist > epsilon}, RMSE Weighted > 0.1: ${rmseWeighted > 0.1}, RMSE Polynomial > 0.1: ${rmsePolynomial > 0.1}, RMSE difference > 0.01: ${Math.abs(rmseWeighted - rmsePolynomial) > 0.01}`);
                }
                
            let firstSegment = split(points, start, furthestIndex);
            let secondSegment = split(points, furthestIndex, end);
    
            // Попытка слияния
            if (canMergeSegments(firstSegment, secondSegment, epsilon)) {
                isLogging() && console.log(`Merging segments at index ${furthestIndex}`);
                // return [firstSegment[0], secondSegment[secondSegment.length - 1]];
                return [...firstSegment.slice(0, -1), secondSegment[secondSegment.length - 1]];
            }
    
            // return [firstSegment[0], firstSegment[firstSegment.length - 1], secondSegment[0], secondSegment[secondSegment.length - 1]];
            return [...firstSegment, ...secondSegment.slice(1)];
        }
    
        isLogging() && console.log(`No split for segment from index ${start} to ${end}`);
        return [points[start], points[end]];
    }
    

    return split(points, 0, points.length - 1);
};

function calculateSegmentLength(segment: IPoint[]): number {
    if (segment.length < 2) {
        return 0;
    }
    return Math.abs(segment[segment.length - 1].x - segment[0].x);
}


function calculateRMSE(originalPoints: IPoint[], approximatedPoints: IPoint[]): number {
    let sumOfSquares = 0;
    const minLength = Math.min(originalPoints.length, approximatedPoints.length);

    for (let i = 0; i < minLength; i++) {
        const origPoint = originalPoints[i];
        const approxPoint = approximatedPoints[i];
        const diff = origPoint.y - approxPoint.y;

        sumOfSquares += diff * diff;
    }

    return Math.sqrt(sumOfSquares / minLength);
}


export default enhancedSplitAndMergeFilter;
