import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

// Функция, реализующая алгоритм Чайкина для сглаживания пути
const chaikinsSmoothingFilter: IFilter = (points: IPoint[], iterations: number = 1): IPoint[] => {
    let smoothedPoints = points;

    for (let iter = 0; iter < iterations; iter++) {
        let newPoints: IPoint[] = [];

        for (let i = 0; i < smoothedPoints.length - 1; i++) {
            const p1 = smoothedPoints[i];
            const p2 = smoothedPoints[i + 1];

            const q = { x: 0.75 * p1.x + 0.25 * p2.x, y: 0.75 * p1.y + 0.25 * p2.y };
            const r = { x: 0.25 * p1.x + 0.75 * p2.x, y: 0.25 * p1.y + 0.75 * p2.y };

            newPoints.push(q, r);
        }

        // Добавляем последнюю точку, если она не была обработана
        if (smoothedPoints.length > 1) {
            newPoints.push(smoothedPoints[smoothedPoints.length - 1]);
        }

        smoothedPoints = newPoints;
    }

    return smoothedPoints;
};

export default chaikinsSmoothingFilter;
