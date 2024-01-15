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
    const threshold = 0.20; // не совсем ясно как он работает, так как не видно визуально отсечения точек.
    let i = 0;
    // 
    while (i < points.length) {
        let windowSize = 1; // сделать адаптивным в зависимости от плотности точек на 1 м?
        while (windowSize < Math.min(maxWindowSize, points.length - i) &&
            Math.abs(points[i + windowSize].x - points[i].x) <= maxLength) { // TODO:  проверить корректность работы с maxLenght
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
    return triangleBaseDistanceFilter(filteredPoints);
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
export const weightedGroundLevelMedianFilterWindowForRailTen = (points, maxWindowSize = 10, maxLength = 0.2) => {
    const filteredPoints = [];
    const threshold = 0.20; // не совсем ясно как он работает, так как не видно визуально отсечения точек.
    let i = 0;
    // 
    while (i < points.length) {
        let windowSize = 10; // сделать адаптивным в зависимости от плотности точек на 1 м?
        while (windowSize < Math.min(maxWindowSize, points.length - i) &&
            Math.abs(points[i + windowSize].x - points[i].x) <= maxLength) { // TODO:  проверить корректность работы с maxLenght
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
export const triangleBaseDistanceFilter = (points, epsilon = 0.15) => {
    const filteredPoints = [];
    if (points.length < 3) {
        return points; // Недостаточно точек для формирования треугольника
    }
    filteredPoints.push(points[0]); // Первая точка всегда добавляется
    for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];
        // Формируем треугольник с вершиной в p2 и основанием p1-p3
        const baseLength = Math.sqrt(Math.pow((p3.x - p1.x), 2) + Math.pow((p3.y - p1.y), 2));
        const height = Math.abs(p2.y - ((p1.y + p3.y) / 2));
        // Если расстояние от вершины до основания треугольника больше epsilon, пропускаем точку
        if (height <= epsilon) {
            filteredPoints.push(p2);
        }
    }
    filteredPoints.push(points[points.length - 1]); // Последняя точка всегда добавляется
    return filteredPoints;
};
export default weightedGroundLevelMedianFilter;
