import splitAndMergeFilter from './splitAndMergeFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';
import leastSquaresWeightedFilter from './leastSquaresWeightedFilter.js';
// Функция для преобразования двух точек в объект с наклоном и пересечением
const lineFromPoints = (pointA, pointB) => {
    const slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const intercept = pointA.y - slope * pointA.x;
    return { slope, intercept, endPoint: pointB };
};
// Функция для нахождения пересечения двух линий, определенных их коэффициентами
const findIntersection = (line1, line2) => {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    return { x, y };
};
function isIntersectionValid(intersection, segment1End, segment2Start) {
    return intersection.x > segment1End.x && intersection.x < segment2Start.x;
}
const tryMergeSegments = (segment1, segment2, epsilon) => {
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
const enhancedSegmentApproximation = (points, epsilon) => {
    // const segmentsBoundaries = enhancedSplitAndMergeFilter(points, epsilon);
    const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
    let enhancedSegments = [];
    let lastLine = null;
    let i = 0;
    while (i < segmentsBoundaries.length - 1) {
        let segmentData = points.slice(points.indexOf(segmentsBoundaries[i]), points.indexOf(segmentsBoundaries[i + 1]) + 1);
        let nextSegmentCombined = false;
        if (i < segmentsBoundaries.length - 2) {
            // Попытка объединить текущий сегмент со следующим
            const nextSegmentData = points.slice(points.indexOf(segmentsBoundaries[i + 1]), points.indexOf(segmentsBoundaries[i + 2]) + 1);
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
            }
            else {
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
