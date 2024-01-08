import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const leastSquaresFilter: IFilter = (points: IPoint[]): IPoint[] => {
    const leastSquaresLine = (points: IPoint[]): { slope: number; intercept: number } => {
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = points.length;
    
        for (const point of points) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
        }
    
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
    
        return { slope, intercept };
    };

    if (points.length < 2) {
        return points; // Возвращаем исходные точки, если их менее двух
    }

    const { slope, intercept } = leastSquaresLine(points);

    // Возвращаем начальную и конечную точки, соответствующие линии наименьших квадратов
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const approximatedFirstPoint = { x: firstPoint.x, y: firstPoint.x * slope + intercept };
    const approximatedLastPoint = { x: lastPoint.x, y: lastPoint.x * slope + intercept };


    // Расчет RMSE
    function calculateRMSE(points: IPoint[], slope:number, intercept:number) {
        let sumOfSquares = 0;
        for (const point of points) {
            const yPredicted = slope * point.x + intercept;
            sumOfSquares += Math.pow(point.y - yPredicted, 2);
        }
        return Math.sqrt(sumOfSquares / points.length);
    }

    const rmse = calculateRMSE(points, slope, intercept);
    // console.log(`RMSE: ${rmse}`);
    
    return [approximatedFirstPoint, approximatedLastPoint];
};

export default leastSquaresFilter;
