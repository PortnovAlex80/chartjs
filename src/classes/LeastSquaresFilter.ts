import { IPoint } from '../interfaces/IPoint';

class LeastSquaresFilter {
    private points: IPoint[];
    public rmse: number;

    constructor(points: IPoint[]) {
        this.points = points;
        this.rmse = 100;
    }

    private leastSquaresLine(): { slope: number; intercept: number } {
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = this.points.length;

        for (const point of this.points) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    public approximatePoints(): IPoint[] {
    // Проверяем, достаточно ли точек для аппроксимации
    if (this.points.length < 2) {
        // Если точек недостаточно, возвращаем исходный набор точек
        return this.points;
    }

        const { slope, intercept } = this.leastSquaresLine();
        const firstPoint = this.points[0];
        const lastPoint = this.points[this.points.length - 1];
        const approximatedFirstPoint = { x: firstPoint.x, y: firstPoint.x * slope + intercept };
        const approximatedLastPoint = { x: lastPoint.x, y: lastPoint.x * slope + intercept };

        this.rmse = this.calculateRMSE();

        return [approximatedFirstPoint, approximatedLastPoint];
    }

    private calculateRMSE(): number {
        const { slope, intercept } = this.leastSquaresLine();
        let sumOfSquares = 0;
        for (const point of this.points) {
            const yPredicted = slope * point.x + intercept;
            sumOfSquares += Math.pow(point.y - yPredicted, 2);
        }
        return Math.sqrt(sumOfSquares / this.points.length);
    }
}

export default LeastSquaresFilter;
