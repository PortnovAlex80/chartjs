const sortAndRemoveDuplicates = (points) => {
    const sortedPoints = points.sort((a, b) => a.x - b.x);
    const uniquePoints = [];
    for (let i = 0; i < sortedPoints.length; i++) {
        if (i === 0 || sortedPoints[i].x !== sortedPoints[i - 1].x) {
            uniquePoints.push(sortedPoints[i]);
        }
        else {
            // Среднее значение Y для дубликатов
            const averageY = (sortedPoints[i].y + sortedPoints[i - 1].y) / 2;
            uniquePoints[uniquePoints.length - 1].y = averageY;
        }
    }
    return uniquePoints;
};
export default sortAndRemoveDuplicates;
