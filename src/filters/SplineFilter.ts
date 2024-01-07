import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import sortAndRemoveDuplicates from './sortAndRemoveDuplicates.js';
import { CubicSpline } from '../utils/CubicSpline.js'; 
import smoothingSpline from '@umn-latis/simple-smoothing-spline';

const splineFilter: IFilter = (points: IPoint[]): IPoint[] => {
    if (points.length < 2) {
        return points; // Not enough points to form a spline
    }
    
    

    points = sortAndRemoveDuplicates(points);
    // points = removeOutliersFilter(points);
    const cubicSpline = smoothingSpline(points, {type: 'cubic'}); 
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const spline = new CubicSpline(xs, ys); // Create a new Spline object

    const interpolatedPoints: IPoint[] = [];

    // Interpolate points at a higher resolution
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const step = (xMax - xMin) / (points.length - 1);

    for (let x = xMin; x <= xMax; x += 0.005) {
        interpolatedPoints.push({ x, y: spline.at(x) });
    }

    return interpolatedPoints;
};


export default splineFilter;

