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
        console.log(`foreach index - ${index}`);
        console.log(`Level - ${level}`);
        console.log(`Y - ${derivativePoint.y}`);
        console.log(`X - ${derivativePoint.x}`);
        console.log(`checking - ${Math.abs(derivativePoint.y - Math.abs(level))}`);
        if (currentSegment.length === 0) {
            console.log("segment 0");
            currentSegment.push(polylinePoints[index]);
        }
        else {
            if (Math.abs((derivativePoint.y) - Math.abs(level)) > epsilon) {
                // Заканчиваем текущий сегмент и начинаем новый
                console.log(`foreach index - ${index}`);
                console.log("level up!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                console.log(`Level - ${level}`);
                console.log(`Y - ${derivativePoint.y}`);
                console.log(`X - ${derivativePoint.x}`);
                console.log(`checking - ${(Math.abs(derivativePoint.y) - Math.abs(level))}`);
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
    // Логируем количество сегментов и их содержимое
    console.log(`Количество сегментов: ${segments.length}`);
    segments.forEach((segment, idx) => {
        console.log(`Сегмент ${idx}:`, segment.map(point => `(${point.x}, ${point.y})`).join(", "));
    });
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
