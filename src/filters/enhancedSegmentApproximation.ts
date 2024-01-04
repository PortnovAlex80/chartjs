import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import splitAndMergeFilter from './splitAndMergeFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';
import leastSquaresWeightedFilter from './leastSquaresWeightedFilter.js';
import enhancedSplitAndMergeFilter from './enhancedSplitAndMergeFilter.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';

// Функция для преобразования двух точек в объект с наклоном и пересечением
const lineFromPoints = (pointA: IPoint, pointB: IPoint): { slope: number; intercept: number,  endPoint: IPoint } => {
    const slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const intercept = pointA.y - slope * pointA.x;
    return { slope, intercept,  endPoint: pointB  };
};

// Функция для нахождения пересечения двух линий, определенных их коэффициентами
const findIntersection = (line1: { slope: number; intercept: number }, line2: { slope: number; intercept: number }): IPoint => {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    return { x, y };
};

function isIntersectionValid(intersection: IPoint, segment1End: IPoint, segment2Start: IPoint): boolean {
    return intersection.x > segment1End.x && intersection.x < segment2Start.x;
}
const tryMergeSegments = (segment1: IPoint[], segment2: IPoint[], epsilon: number): IPoint[] | null => {
    const combinedSegmentData = [...segment1, ...segment2];
    const segmentLinePoints = leastSquaresFilter(combinedSegmentData);
    const segmentLine = lineFromPoints(segmentLinePoints[0], segmentLinePoints[1]);

    // Проверяем, удовлетворяют ли все точки условию погрешности
    for (const point of combinedSegmentData) {
        const projectedY = segmentLine.slope * point.x + segmentLine.intercept;
        if (Math.abs(point.y - projectedY) > epsilon) {
            return null; // Не удовлетворяет условию погрешности
        }
    }

    return segmentLinePoints; // Удовлетворяет условию погрешности
};


// Функция для улучшенной аппроксимации сегментов
const enhancedSegmentApproximation: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    // const segmentsBoundaries = enhancedSplitAndMergeFilter(points, epsilon);
    // const segmentsBoundaries = new CubicPolynomialApproximation().findQualitySegments(points);
    const segmentsBoundaries = splitAndMergeFilter(points, epsilon);

    let enhancedSegments: IPoint[] = [];
    let lastLine = null;

    let i = 0;
    while (i < segmentsBoundaries.length - 1) {
        let segmentData = points.slice(
            points.indexOf(segmentsBoundaries[i]),
            points.indexOf(segmentsBoundaries[i + 1]) + 1
        );

        let nextSegmentCombined = false;
        if (i < segmentsBoundaries.length - 2) {
            // Попытка объединить текущий сегмент со следующим
            const nextSegmentData = points.slice(
                points.indexOf(segmentsBoundaries[i + 1]),
                points.indexOf(segmentsBoundaries[i + 2]) + 1
            );
            const mergedSegment = tryMergeSegments(segmentData, nextSegmentData, epsilon);

            if (mergedSegment) {
                segmentData = [...segmentData, ...nextSegmentData.slice(1)]; // Объединяем данные сегментов
                nextSegmentCombined = true;
            }
        }

        // Применяем метод наименьших квадратов к сегменту
        const segmentLinePoints = leastSquaresWeightedFilter(segmentData, epsilon);
        const segmentLine = lineFromPoints(segmentLinePoints[0], segmentLinePoints[1]);

        if (i === 0) {
            enhancedSegments.push(segmentLinePoints[0]);
        }

        if (lastLine) {
            const intersection = findIntersection(lastLine, segmentLine);
            if (isIntersectionValid(intersection, lastLine.endPoint, segmentLinePoints[0])) {
                enhancedSegments.push(intersection);
            } else {
                // Усреднение
                enhancedSegments.push({
                    x: (lastLine.endPoint.x + segmentLinePoints[0].x) / 2,
                    y: (lastLine.endPoint.y + segmentLinePoints[0].y) / 2
                });
            }
        }

        lastLine = segmentLine;

        if (nextSegmentCombined) {
            i++; // Пропускаем следующий сегмент, так как он уже объединен
        }

        if (i === segmentsBoundaries.length - 2) {
            enhancedSegments.push(segmentLinePoints[1]);
        }

        i++;
    }

    return enhancedSegments;
};

export default enhancedSegmentApproximation;
