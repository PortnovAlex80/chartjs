import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const splitAndMergeFilter: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    if (points.length < 2) {
        return points; // Not enough points to split or merge
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
        let combinedSegment = [segment1[0], segment2[1]];
        for (let point of segment1.concat(segment2)) {
            if (perpendicularDistance(combinedSegment[0], combinedSegment[1], point) > epsilon) {
                return false;
            }
        }
        return true;
    }

    function split(points: IPoint[], start: number, end: number): IPoint[] {
        let furthestIndex = findFurthestPointIndex(points, start, end);
        if (perpendicularDistance(points[start], points[end], points[furthestIndex]) > epsilon) {
            let firstSegment = split(points, start, furthestIndex);
            let secondSegment = split(points, furthestIndex, end);
            let lastPointFirstSegment = firstSegment[firstSegment.length - 1];
            let firstPointSecondSegment = secondSegment[0];

            // Попытка слияния
            if (canMergeSegments(firstSegment, secondSegment, epsilon)) {
                return [...firstSegment.slice(0, -1), secondSegment[secondSegment.length - 1]];
            }

            return [...firstSegment, ...secondSegment.slice(1)];
        }
        return [points[start], points[end]];
    }

    return split(points, 0, points.length - 1);
};

export default splitAndMergeFilter;
