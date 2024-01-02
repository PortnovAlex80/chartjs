import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import simpleSmoothingSpline from '@umn-latis/simple-smoothing-spline';
import sortAndRemoveDuplicates from './sortAndRemoveDuplicates.js';
import smoothingSpline from '@umn-latis/simple-smoothing-spline';

const splineFilterAsync = async (points: IPoint[]): Promise<IPoint[]> => {
    if (points.length < 2) {
        return points;
    }
    
    points = sortAndRemoveDuplicates(points);

    const spline = await smoothingSpline(points, { lambda: 0.001, type: 'smoothing'})

    
    const interpolatedPoints: IPoint[] = [];
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const step = (xMax - xMin) / (points.length - 1);

    for (let x = xMin; x <= xMax; x += 0.005) {
        const y = spline.fn(x); // Получение значения y для каждого x
        interpolatedPoints.push({ x, y });
    }

    return interpolatedPoints;
};

export default splineFilterAsync;
