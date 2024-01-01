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
// const enhancedSegmentApproximation: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
//     // Получаем сегменты с помощью Split-and-Merge
//     const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
//     let enhancedSegments: IPoint[] = [];
//     let lastLine = null;
//         // Убедимся, что добавляем начальную точку первого сегмента
//         if (segmentsBoundaries.length > 0) {
//             enhancedSegments.push(segmentsBoundaries[0]);
//         }
//     for (let i = 0; i < segmentsBoundaries.length - 1; i++) {
//         // Восстанавливаем исходные данные для текущего сегмента
//         const segmentData = points.slice(
//             points.indexOf(segmentsBoundaries[i]),
//             points.indexOf(segmentsBoundaries[i + 1]) + 1
//         );
//         // Применяем метод наименьших квадратов к сегменту
//         const segmentLinePoints = leastSquaresFilter(segmentData,0.3);
//         const segmentLine = lineFromPoints(segmentLinePoints[0], segmentLinePoints[1]);
//         if (lastLine) {
//             // Находим пересечение с предыдущим сегментом и корректируем границы
//             const intersection = findIntersection(lastLine, segmentLine); 
//             enhancedSegments[enhancedSegments.length - 1] = intersection; // Коррекция последней точки предыдущего сегмента
//             enhancedSegments.push(intersection); // Добавление точки пересечения как первой точки текущего сегмента
//         }
//         // Добавляем вторую точку текущего сегмента (границу)
//         enhancedSegments.push(segmentData[segmentData.length - 1]);
//         // Сохраняем линию текущего сегмента для использования в следующей итерации
//         lastLine = segmentLine;
//     }
const enhancedSegmentApproximation = (points, epsilon) => {
    const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
    let enhancedSegments = [];
    for (let i = 0; i < segmentsBoundaries.length - 1; i++) {
        // Восстанавливаем исходные данные для текущего сегмента
        const startIndex = points.indexOf(segmentsBoundaries[i]);
        const endIndex = points.indexOf(segmentsBoundaries[i + 1]) + 1;
        let segmentData = points.slice(startIndex, endIndex);
        // Удаляем граничные точки сегмента, если это возможно (оставляем минимум 2 точки для аппроксимации)
        if (segmentData.length > 3) {
            segmentData = segmentData.slice(1, -1);
        }
        // Применяем метод наименьших квадратов к сегменту
        const segmentLinePoints = leastSquaresFilter(segmentData, epsilon);
        // Добавляем полученные точки в результат
        enhancedSegments.push(...segmentLinePoints);
        // Добавляем границу текущего сегмента
        if (i < segmentsBoundaries.length - 2) {
            enhancedSegments.push(points[endIndex - 1]);
        }
    }
    return enhancedSegments;
};
export default enhancedSegmentApproximation;
