const filterXRange = (points, minX, maxX) => {
    // Filter the points to keep only those within the specified X-axis range
    const filteredPoints = points.filter(point => point.x >= minX && point.x <= maxX);
    return filteredPoints;
};
export default filterXRange;
