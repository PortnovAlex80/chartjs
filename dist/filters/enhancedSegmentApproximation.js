import splitAndMergeFilter from './splitAndMergeFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';
// Функция для преобразования двух точек в объект с наклоном и пересечением
const lineFromPoints = (pointA, pointB) => {
    const slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const intercept = pointA.y - slope * pointA.x;
    return { slope, intercept };
};
// Функция для нахождения пересечения двух линий, определенных их коэффициентами
const findIntersection = (line1, line2) => {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    return { x, y };
};
// Функция для улучшенной аппроксимации сегментов
const enhancedSegmentApproximation = (points, epsilon) => {
    const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
    let enhancedSegments = [];
    let lastLine = null;
    for (let i = 0; i < segmentsBoundaries.length - 1; i++) {
        const segmentData = points.slice(points.indexOf(segmentsBoundaries[i]), points.indexOf(segmentsBoundaries[i + 1]) + 1);
        // Применяем метод наименьших квадратов к сегменту
        const segmentLinePoints = leastSquaresFilter(segmentData, epsilon);
        const segmentLine = lineFromPoints(segmentLinePoints[0], segmentLinePoints[1]);
        if (i === 0) {
            // Для первого сегмента добавляем его начальную точку
            enhancedSegments.push(segmentLinePoints[0]);
        }
        if (lastLine) {
            // Находим пересечение с предыдущим сегментом
            const intersection = findIntersection(lastLine, segmentLine);
            enhancedSegments.push(intersection);
        }
        // Сохраняем линию текущего сегмента для использования в следующей итерации
        lastLine = segmentLine;
        if (i === segmentsBoundaries.length - 2) {
            // Для последнего сегмента добавляем его конечную точку
            enhancedSegments.push(segmentLinePoints[1]);
        }
    }
    return enhancedSegments;
};
export default enhancedSegmentApproximation;
