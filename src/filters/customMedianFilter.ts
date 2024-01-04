import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const customMedianFilter: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    // Функция для вычисления медианы массива чисел
    const median = (arr: number[]): number => {
        const sortedArr = [...arr].sort((a, b) => a - b);
        const midIndex = Math.floor(sortedArr.length / 2);
        return sortedArr.length % 2 !== 0 
            ? sortedArr[midIndex] 
            : (sortedArr[midIndex - 1] + sortedArr[midIndex]) / 2;
    };

    // Применение медианного фильтра к каждой точке
    return points.map((point, index, arr) => {
        // Выборка окна вокруг текущей точки
        const start = Math.max(index - epsilon, 0);
        const end = Math.min(index + epsilon + 1, arr.length);
        const window = arr.slice(start, end).map(p => p.y);

        // Вычисление медианы и создание новой точки с отфильтрованным значением
        const medianY = median(window);
        return { x: point.x, y: medianY };
    });
};

export default customMedianFilter;
