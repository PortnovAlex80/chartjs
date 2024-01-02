import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const leastSquaresWeightedFilter: IFilter = (points: IPoint[]): IPoint[] => {
    if (points.length < 2) {
        return points;
    }
    // Критерий, при котором вес обнуляется
    const threshold = 0.25
    ;

    const calculateDistance = (point: IPoint, slope: number, intercept: number): number => {
        // Расчет расстояния от точки до линии
        return Math.abs(point.y - (slope * point.x + intercept));
    };

    const leastSquaresLine = (points: IPoint[], weights: number[]): { slope: number; intercept: number } => {
        let sumWX = 0, sumWY = 0, sumWXY = 0, sumWXX = 0, sumW = 0;
        points.forEach((point, index) => {
            const weight = weights[index];
            sumWX += weight * point.x;
            sumWY += weight * point.y;
            sumWXY += weight * point.x * point.y;
            sumWXX += weight * point.x * point.x;
            sumW += weight;
        });

        const slope = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
        const intercept = (sumWY - slope * sumWX) / sumW;
    
        return { slope, intercept };
    };

    if (points.length < 2) {
        return points; // Возвращаем исходные точки, если их менее двух
    }

    // Начальное предположение: все веса равны 1
    let weights = points.map(() => 1);

    // Начальное вычисление линии
    let { slope, intercept } = leastSquaresLine(points, weights);

// Обновление весов и исключение точек с большим отклонением
const filteredPoints = points.filter((point, index) => {
    const distance = calculateDistance(point, slope, intercept);
    if (distance > threshold) {
        return false; // Исключаем точку
    }
    weights[index] = 1 / (distance * distance);
    return true;
});

// Вычисление линии с учетом новых весов
if (filteredPoints.length > 1) {
    ({ slope, intercept } = leastSquaresLine(filteredPoints, weights.filter((_, index) => filteredPoints[index])));
}

// Третий цикл обновления весов и вычисления линии
const thirdFilteredPoints = filteredPoints.filter((point, index) => {
    const distance = calculateDistance(point, slope, intercept);
    if (distance > threshold) {
        return false;
    }
    weights[index] = 1 / (distance * distance);
    return true;
});

if (thirdFilteredPoints.length > 1) {
    ({ slope, intercept } = leastSquaresLine(thirdFilteredPoints, weights.filter((_, index) => thirdFilteredPoints[index])));
}


    // Возвращаем начальную и конечную точки, соответствующие взвешенной линии наименьших квадратов
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const approximatedFirstPoint = { x: firstPoint.x, y: firstPoint.x * slope + intercept };
    const approximatedLastPoint = { x: lastPoint.x, y: lastPoint.x * slope + intercept };

    return [approximatedFirstPoint, approximatedLastPoint];
};

export default leastSquaresWeightedFilter;
