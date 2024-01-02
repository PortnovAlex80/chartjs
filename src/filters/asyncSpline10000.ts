import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import simpleSmoothingSpline from '@umn-latis/simple-smoothing-spline';
import sortAndRemoveDuplicates from './sortAndRemoveDuplicates.js';
import smoothingSpline from '@umn-latis/simple-smoothing-spline';

const splineFilterAsync10000 = async (points: IPoint[]): Promise<IPoint[]> => {
    if (points.length < 2) {
        return points;
    }
    
    points = sortAndRemoveDuplicates(points);

    const spline = await smoothingSpline(points, { lambda: 1, type: 'cubic'})

    
    const interpolatedPoints: IPoint[] = [];
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const step = (xMax - xMin) / (points.length - 1);

    for (let x = xMin; x <= xMax; x += 0.1) {
        const y = spline.fn(x); // Получение значения y для каждого x
        interpolatedPoints.push({ x, y });
    }

    return interpolatedPoints;
};

export default splineFilterAsync10000;
