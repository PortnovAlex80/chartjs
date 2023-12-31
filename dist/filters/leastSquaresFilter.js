const leastSquaresFilter = (points, epsilon) => {
    // Реализация метода наименьших квадратов и логика фильтра
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
    const approximate = (points, epsilon) => {
        if (points.length < 3) {
            return points;
        }
        const { slope, intercept } = leastSquaresLine(points);
        let maxDistance = 0;
        let maxIndex = 0;
        points.forEach((point, index) => {
            const distance = Math.abs(slope * point.x + intercept - point.y);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = index;
            }
        });
        if (maxDistance > epsilon) {
            // Убедитесь, что сегменты уменьшаются
            if (maxIndex === 0 || maxIndex === points.length - 1) {
                return [points[0], points[points.length - 1]];
            }
            const left = approximate(points.slice(0, maxIndex + 1), epsilon);
            const right = approximate(points.slice(maxIndex), epsilon);
            return [...left.slice(0, -1), ...right];
        }
        else {
            return [points[0], points[points.length - 1]];
        }
    };
    return approximate(points, epsilon);
};
export default leastSquaresFilter;
