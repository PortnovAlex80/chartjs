// Функция для фильтрации выбросов
export const removeOutliersFilter = (points, threshold = 10) => {
    const ys = points.map(p => p.y);
    const meanY = ys.reduce((acc, val) => acc + val, 0) / ys.length;
    const standardDeviation = Math.sqrt(ys.map(y => Math.pow(y - meanY, 2)).reduce((acc, val) => acc + val, 0) / ys.length);
    return points.filter(p => Math.abs(p.y - meanY) / standardDeviation < threshold);
};
