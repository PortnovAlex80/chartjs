import { measureDistancesToPolyline } from '../filters/measureDistancesToPolyline.js';
import derivativeFilter from '../filters/derivativeFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';
function segmentAndApproximate(polylinePoints, epsilon) {
    const points = leastSquaresFilter(polylinePoints, 1);
    const distancePoints = measureDistancesToPolyline(points, polylinePoints);
    const derivativePoints = derivativeFilter(distancePoints);
    let windowSize = 5;
    let derivativeWindow = [];
    const segments = [];
    let currentSegment = [];
    let level = 0;
    console.log(derivativePoints.length);
    derivativePoints.forEach((derivativePoint, index) => {
        // Обновляем окно производных
        if (derivativeWindow.length >= windowSize) {
            derivativeWindow.shift();
        }
        derivativeWindow.push(derivativePoint.y);
        let averageDerivative = derivativeWindow.reduce((a, b) => a + b, 0) / derivativeWindow.length;
        if (currentSegment.length === 0) {
            console.log("segment 0");
            currentSegment.push(polylinePoints[index]);
        }
        else {
            if (Math.abs((derivativePoint.y) - averageDerivative) > epsilon) {
                // Заканчиваем текущий сегмент и начинаем новый
                level = Math.abs(derivativePoint.y);
                currentSegment.push(polylinePoints[index]);
                segments.push(currentSegment);
                currentSegment = [polylinePoints[index]];
            }
            else {
                // Продолжаем добавлять точки в текущий сегмент
                currentSegment.push(polylinePoints[index]);
            }
        }
    });
    console.log(`foreach index end- ${derivativePoints.length}`);
    // Добавляем последний сегмент
    if (currentSegment.length > 1) {
        segments.push(currentSegment);
    }
    console.log(`Добавляем последний сегмент ${currentSegment.length}`);
    // derivativePoints.forEach((point, index) => {
    //     console.log(`Точка ${index}: x = ${point.x}, y = ${point.y}`);
    // });
    // Аппроксимация каждого сегмента и объединение результатов в один массив
    const approximatedPoints = [];
    segments.forEach((segment, idx) => {
        // Проверяем, что сегмент содержит более одной точки перед аппроксимацией
        if (segment.length > 1) {
            const approximatedSegment = leastSquaresFilter(segment, epsilon);
            approximatedPoints.push(...approximatedSegment);
        }
        else {
            // Если в сегменте одна точка, просто добавляем её без аппроксимации
            console.log(`Внимание: сегмент с индексом ${idx} содержит только одну точку и не будет аппроксимирован.`);
            approximatedPoints.push(...segment);
        }
    });
    return approximatedPoints;
}
export default segmentAndApproximate;
