/**
 * Взвешенный медианный фильтр по уровню земли.
 * Фильтр ищет в каждом окне точку с наименьшей координатой Y (базовая точка) и
 * присваивает ей максимальный вес. Остальные точки в окне получают веса, основанные
 * на их вертикальном расстоянии от базовой точки. Точки, находящиеся на расстоянии
 * более 20 см от базовой точки по вертикали, исключаются из рассмотрения.
 *
 * @param {IPoint[]} points - Массив точек для фильтрации.
 * @param {number} maxWindowSize - Максимальный размер окна для медианной фильтрации.
 * @param {number} maxLength - Максимальная длина интервала для одного окна фильтрации.
 * @returns {IPoint[]} Отфильтрованный набор точек.
 */
const weightedGroundLevelMedianFilter = (points, maxWindowSize = 10, maxLength = 0.2) => {
    const filteredPoints = [];
    const threshold = 0.20;
    let i = 0;
    while (i < points.length) {
        let windowSize = 10;
        while (windowSize < Math.min(maxWindowSize, points.length - i) &&
            Math.abs(points[i + windowSize].x - points[i].x) <= maxLength) {
            windowSize++;
        }
        const windowPoints = points.slice(i, i + windowSize);
        const basePoint = windowPoints.reduce((lowest, point) => point.y < lowest.y ? point : lowest, windowPoints[0]);
        const weightedPoints = windowPoints.filter(point => Math.abs(point.y - basePoint.y) <= threshold);
        const weightedMedianX = getWeightedMedian(weightedPoints.map(p => p.x), basePoint, weightedPoints);
        const weightedMedianY = getWeightedMedian(weightedPoints.map(p => p.y), basePoint, weightedPoints);
        filteredPoints.push({ x: weightedMedianX, y: weightedMedianY });
        i += windowSize;
    }
    return filteredPoints;
};
function getWeightedMedian(values, basePoint, weightedPoints) {
    // Создаем массив пар значений и их весов
    const weightedValues = values.map((value, index) => {
        const weight = 1 - Math.abs(weightedPoints[index].y - basePoint.y) / 0.2;
        return { value, weight };
    });
    // Сортируем пары по значению
    weightedValues.sort((a, b) => a.value - b.value);
    // Вычисляем накопленные веса
    let totalWeight = weightedValues.reduce((sum, { weight }) => sum + weight, 0);
    let accumulatedWeight = 0;
    // Находим взвешенную медиану
    for (const { value, weight } of weightedValues) {
        accumulatedWeight += weight;
        if (accumulatedWeight >= totalWeight / 2) {
            return value;
        }
    }
    // В случае, если медиана не найдена (теоретически не должно произойти), возвращаем среднее значение
    return weightedValues[weightedValues.length / 2].value;
}
export default weightedGroundLevelMedianFilter;
