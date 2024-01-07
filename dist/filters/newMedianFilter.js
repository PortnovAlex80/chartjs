const enhancedMedianFilter = (points, maxWindowSize = 10, maxLength = 0.05) => {
    const filteredPoints = [];
    let i = 0;
    while (i < points.length) {
        let windowSize = 1;
        while (windowSize < Math.min(maxWindowSize, points.length - i) &&
            Math.abs(points[i + windowSize].x - points[i].x) <= maxLength) {
            windowSize++;
        }
        const windowPoints = points.slice(i, i + windowSize);
        const medianX = getMedian(windowPoints.map(p => p.x));
        const medianY = getMedian(windowPoints.map(p => p.y));
        filteredPoints.push({ x: medianX, y: medianY });
        i += windowSize; // Move to the next window
    }
    return filteredPoints;
};
const getMedian = (values) => {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
export default enhancedMedianFilter;
