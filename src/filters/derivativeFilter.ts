import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const derivativeFilter: IFilter = (points: IPoint[]): IPoint[] => {
    if (points.length < 2) {
        // Если точек меньше двух, производную вычислить нельзя
        return [];
    }

    const derivativePoints: IPoint[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;

        // Вычисляем производную как отношение изменения y к изменению x
        const derivative = dy / dx;
        
        // Средняя точка между i и i + 1 для x координаты
        const midX = (points[i].x + points[i + 1].x) / 2;

        derivativePoints.push({ x: midX, y: derivative });
    }

    return derivativePoints;
};

export default derivativeFilter;
