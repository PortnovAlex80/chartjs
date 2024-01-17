import leastSquaresFilter from './LeastSquaresFilter.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
// Функция для преобразования двух точек в объект с наклоном и пересечением
const lineFromPoints = (pointA, pointB) => {
    const slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const intercept = pointA.y - slope * pointA.x;
    // console.log(`lineFromPoints: PointA: ${JSON.stringify(pointA)}, PointB: ${JSON.stringify(pointB)}, Slope: ${slope}, Intercept: ${intercept}`);
    return { slope, intercept, endPoint: pointB };
};
// Функция для нахождения пересечения двух линий, определенных их коэффициентами
const findIntersection = (line1, line2) => {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    // console.log(`findIntersection: Line1: ${JSON.stringify(line1)}, Line2: ${JSON.stringify(line2)}, Intersection: (${x}, ${y})`);
    return { x, y };
};
function isIntersectionValid(intersection, segment1End, segment2Start) {
    const isXValid = intersection.x > segment1End.x && intersection.x < segment2Start.x;
    const minY = Math.min(segment1End.y, segment2Start.y);
    const maxY = Math.max(segment1End.y, segment2Start.y);
    const isYValid = intersection.y >= minY && intersection.y <= maxY;
    return isXValid && isYValid;
}
function perpendicularDistance(pointA, pointB, pointC) {
    let area = Math.abs(0.5 * (pointA.x * (pointB.y - pointC.y) + pointB.x * (pointC.y - pointA.y) + pointC.x * (pointA.y - pointB.y)));
    let bottom = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
    return (area / bottom) * 2;
}
function canMergeSegments(segment1, segment2, epsilon) {
    let combinedSegment = [segment1[0], segment2[segment2.length - 1]]; // Используем первую точку первого сегмента и последнюю точку второго сегмента
    for (let point of segment1.concat(segment2)) {
        let perpendicularDistanceSegments = perpendicularDistance(combinedSegment[0], combinedSegment[1], point);
        // console.log(`Distance is ${perpendicularDistanceSegments} and this is ${((perpendicularDistanceSegments) > epsilon)}`)
        if ((perpendicularDistanceSegments) > epsilon) {
            return false;
        }
    }
    // console.log(`Can merge`)
    return true;
}
const tryMergeSegments = (segment1, segment2, epsilon) => {
    const combinedSegmentData = [...segment1, ...segment2];
    // console.log(`combinedSegmentData - ${JSON.stringify(combinedSegmentData)}`)
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
    // const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
    // const segmentsBoundaries = new CubicPolynomialApproximation().findQualitySegments(points);
    const segmentsBoundaries = new CubicPolynomialApproximation().findRandomQualitySegments(points);
    segmentsBoundaries.forEach(point => { console.log(`${JSON.stringify(point)}`); });
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
        const segmentLinePoints = leastSquaresFilter(segmentData);
        const segmentLine = lineFromPoints(segmentLinePoints[0], segmentLinePoints[1]);
        console.log(`Segment line после least - ${JSON.stringify(segmentLinePoints[0])} - ${JSON.stringify(segmentLinePoints[1])} `);
        if (i === 0) {
            enhancedSegments.push(segmentLinePoints[0]);
        }
        if (lastLine) {
            console.log(`Обработка пересечения сегментов ${i - 1} и ${i}`);
            const intersection = findIntersection(lastLine, segmentLine);
            // Проверяем, совпадают ли точки
            const pointsAreSame = Math.abs(lastLine.endPoint.x - segmentLinePoints[0].x) < 0.001 &&
                Math.abs(lastLine.endPoint.y - segmentLinePoints[0].y) < 0.001;
            if (pointsAreSame) {
                console.log(`Точки сегментов ${i - 1} и ${i} совпадают, пропускаем проверку на пересечение`);
                enhancedSegments.push(segmentLinePoints[0]);
            }
            else if (isIntersectionValid(intersection, lastLine.endPoint, segmentLinePoints[0])) {
                console.log(`Валидное пересечение для сегментов ${i - 1} и ${i}:`, intersection);
                enhancedSegments.push(intersection);
            }
            else {
                // Усреднение
                console.log(`Пересечение невалидно, усреднение точек между сегментами ${i - 1} и ${i}`);
                console.log(`Усреднение lastLine.endPoint:`, lastLine.endPoint);
                console.log(`Усреднение segmentLinePoints[0]:`, segmentLinePoints[0]);
                // enhancedSegments.push({
                //     x: (lastLine.endPoint.x + segmentLinePoints[0].x) / 2,
                //     y: (lastLine.endPoint.y + segmentLinePoints[0].y) / 2
                // });
                enhancedSegments.push({
                    x: (segmentLinePoints[0].x),
                    y: (segmentLinePoints[0].y)
                });
            }
        }
        lastLine = segmentLine;
        if (nextSegmentCombined) {
            // console.log(`Сегмент ${i} был объединен со следующим сегментом`);
            i++; // Пропускаем следующий сегмент, так как он уже объединен
        }
        if (i === segmentsBoundaries.length - 2) {
            enhancedSegments.push(segmentLinePoints[1]);
        }
        i++;
    }
    // console.log(`enhancedSegmentApproximation: Enhanced segments: ${JSON.stringify(enhancedSegments)}`);
    return enhancedSegments;
};
export default enhancedSegmentApproximation;
