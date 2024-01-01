import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import splitAndMergeFilter from './splitAndMergeFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';

// Функция для преобразования двух точек в объект с наклоном и пересечением
const lineFromPoints = (pointA: IPoint, pointB: IPoint): { slope: number; intercept: number } => {
    const slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const intercept = pointA.y - slope * pointA.x;
    return { slope, intercept };
};

// Функция для нахождения пересечения двух линий, определенных их коэффициентами
const findIntersection = (line1: { slope: number; intercept: number }, line2: { slope: number; intercept: number }): IPoint => {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    return { x, y };
};


// Функция для улучшенной аппроксимации сегментов
const enhancedSegmentApproximation: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
    let enhancedSegments: IPoint[] = [];
    let lastLine = null;

    for (let i = 0; i < segmentsBoundaries.length - 1; i++) {
        const segmentData = points.slice(
            points.indexOf(segmentsBoundaries[i]),
            points.indexOf(segmentsBoundaries[i + 1]) + 1
        );

        // Применяем метод наименьших квадратов к сегменту
        const segmentLinePoints = leastSquaresFilter(segmentData);
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



// const enhancedSegmentApproximation: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
//     const segmentsBoundaries = splitAndMergeFilter(points, epsilon);
//     let enhancedSegments: IPoint[] = [];
    
//     for (let i = 0; i < segmentsBoundaries.length - 1; i++) {
//         // Восстанавливаем исходные данные для текущего сегмента
//         const startIndex = points.indexOf(segmentsBoundaries[i]);
//         const endIndex = points.indexOf(segmentsBoundaries[i + 1]) + 1;
//         let segmentData = points.slice(startIndex, endIndex);

//         // Удаляем граничные точки сегмента, если это возможно (оставляем минимум 2 точки для аппроксимации)
//         if (segmentData.length > 3) {
//             segmentData = segmentData.slice(1, -1);
//         }

//         // Применяем метод наименьших квадратов к сегменту
//         const segmentLinePoints = leastSquaresFilter(segmentData, epsilon);

//         // Добавляем полученные точки в результат
//         enhancedSegments.push(...segmentLinePoints);

//         // Добавляем границу текущего сегмента
//         if (i < segmentsBoundaries.length - 2) {
//             enhancedSegments.push(points[endIndex - 1]);
//         }
//     }

//     return enhancedSegments;