import leastSquaresFilter from './leastSquaresFilter.js';
import leastSquaresWeightedFilter from './leastSquaresWeightedFilter.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
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
    const isXValid = intersection.x > segment1End.x && intersection.x < segment2Start.x;
    const minY = Math.min(segment1End.y, segment2Start.y);
    const maxY = Math.max(segment1End.y, segment2Start.y);
    const isYValid = intersection.y >= minY && intersection.y <= maxY;
    return isXValid && isYValid;
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
/**
 * Модуль для улучшенной аппроксимации сегментов.
 * Этот модуль использует комбинацию различных алгоритмов фильтрации и аппроксимации для
 * обработки набора точек. Он включает в себя попытки объединения сегментов на основе
 * линейной аппроксимации, а также улучшенные методы разбиения и слияния сегментов.
 *
 * Процесс аппроксимации включает в себя следующие этапы:
 * 1. Разбиение точек на сегменты с использованием улучшенного алгоритма разбиения и слияния.
 * 2. Попытка объединения последовательных сегментов на основе критерия минимальной погрешности.
 * 3. Применение взвешенного метода наименьших квадратов к каждому сегменту.
 * 4. Обработка точек пересечения между сегментами для обеспечения плавности переходов.
 *
 * @param {IPoint[]} points - Массив точек для аппроксимации.
 * @param {number} epsilon - Пороговое значение погрешности для различных этапов аппроксимации.
 * @returns {IPoint[]} Массив точек, представляющих улучшенную аппроксимацию исходного набора данных.
 */
const enhancedSegmentApproximation = (points, epsilon) => {
    // выбор механизма сегментирования:
    // const segmentsBoundaries = enhancedSplitAndMergeFilter(points, epsilon);
    const segmentsBoundaries = new CubicPolynomialApproximation().findQualitySegments(points);
    // const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
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
                console.log(`УСредненение lastLine${lastLine.endPoint.y}`);
                console.log(`УСредненение  segmentLinePoints ${segmentLinePoints[0].y}`);
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
