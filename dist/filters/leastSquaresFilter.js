const leastSquaresFilter = (points) => {
    const leastSquaresLine = (points) => {
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
    return [approximatedFirstPoint, approximatedLastPoint];
};
export default leastSquaresFilter;
