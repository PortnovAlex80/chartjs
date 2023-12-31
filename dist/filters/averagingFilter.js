// Функция для расчета расстояния между двумя точками в декартовых координатах
function calculateDistance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}
const averagingFilter = (points, windowSizeInMeters) => {
    const smoothedPoints = [];
    for (let i = 0; i < points.length; i++) {
        let sumX = 0, sumY = 0, count = 0;
        for (let j = -points.length; j < points.length; j++) {
            const index = i + j;
            if (index >= 0 && index < points.length) {
                const distance = calculateDistance(points[i], points[index]);
                if (distance <= windowSizeInMeters / 2) {
                    sumX += points[index].x;
                    sumY += points[index].y;
                    count++;
                }
            }
        }
        smoothedPoints.push({ x: sumX / count, y: sumY / count });
    }
    return smoothedPoints;
};
export default averagingFilter;
