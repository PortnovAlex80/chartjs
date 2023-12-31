const averagingFilter = (points, windowSize = 3) => {
    const smoothedPoints = [];
    for (let i = 0; i < points.length; i++) {
        let sumX = 0, sumY = 0, count = 0;
        for (let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
            const index = i + j;
            if (index >= 0 && index < points.length) {
                sumX += points[index].x;
                sumY += points[index].y;
                count++;
            }
        }
        smoothedPoints.push({ x: sumX / count, y: sumY / count });
    }
    return smoothedPoints;
};
export default averagingFilter;
