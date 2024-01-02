var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sortAndRemoveDuplicates from './sortAndRemoveDuplicates.js';
import smoothingSpline from '@umn-latis/simple-smoothing-spline';
const splineFilterAsync = (points) => __awaiter(void 0, void 0, void 0, function* () {
    if (points.length < 2) {
        return points;
    }
    points = sortAndRemoveDuplicates(points);
    const spline = yield smoothingSpline(points, { lambda: 0.001, type: 'smoothing' });
    const interpolatedPoints = [];
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const step = (xMax - xMin) / (points.length - 1);
    for (let x = xMin; x <= xMax; x += 0.005) {
        const y = spline.fn(x); // Получение значения y для каждого x
        interpolatedPoints.push({ x, y });
    }
    return interpolatedPoints;
});
export default splineFilterAsync;
