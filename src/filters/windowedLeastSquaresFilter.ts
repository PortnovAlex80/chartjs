import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import leastSquaresFilter from './leastSquaresFilter.js';
import leastSquaresWeightedFilter from '../filters/leastSquaresWeightedFilter.js';


const windowedLeastSquaresFilter: IFilter = (points: IPoint[]): IPoint[] => {
    if (points.length < 2) {
        return points;
    }

    // Сортировка точек по X
    points.sort((a, b) => a.x - b.x);
    const result: IPoint[] = [];
    const step = 1; // Шаг для участков в 1 метр

    for (let i = 0; i < points.length; i += step) {
        // Выбор участка
        const windowPoints = points.slice(i, i + step);
        // Применение метода наименьших квадратов
        const approxPoints = leastSquaresWeightedFilter(windowPoints);
        // Интерполяция результатов
        for (let x = windowPoints[0].x; x <= windowPoints[windowPoints.length - 1].x; x += 0.1) {
            const y = linearInterpolate(x, approxPoints);
            result.push({ x, y });
        }
    }

    return result;
};

function linearInterpolate(x: number, points: IPoint[]): number {
    for (let i = 0; i < points.length - 1; i++) {
        if (x >= points[i].x && x <= points[i + 1].x) {
            const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
            return points[i].y * (1 - t) + points[i + 1].y * t;
        }
    }
    return points[points.length - 1].y; // Если x вне диапазона точек, вернуть значение последней точки
}

export default windowedLeastSquaresFilter;
