const medianFilter = (points, epsilon = 3) => {
    // Функция для вычисления медианы массива чисел
    const median = (arr) => {
        const mid = Math.floor(arr.length / 2);
        const nums = [...arr].sort((a, b) => a - b);
        return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };
    // Применение медианного фильтра к каждой точке
    return points.map((point, index, arr) => {
        // Выборка окна вокруг текущей точки
        const window = arr.slice(Math.max(index - epsilon, 0), Math.min(index + epsilon + 1, arr.length)).map(p => p.y);
        // Вычисление медианы и создание новой точки с отфильтрованным значением
        const medianY = median(window);
        return { x: point.x, y: medianY };
    });
};
export default medianFilter;
