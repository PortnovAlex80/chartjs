import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const orderByXFilter: IFilter = (points: IPoint[]): IPoint[] => {
    // Копируем массив, чтобы не изменять исходный
    const pointsCopy = [...points];

    // Сортируем точки по возрастанию координаты X
    pointsCopy.sort((a, b) => a.x - b.x);

    return pointsCopy;
};

export default orderByXFilter;
