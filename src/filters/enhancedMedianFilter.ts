import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

/**
 * Модуль EnhancedMedianFilter предназначен для фильтрации и нормализации набора точек.
 * Этот фильтр применяет алгоритм медианной фильтрации с рекурсивным уточнением.
 * В процессе фильтрации вычисляется медианное значение для заданного окна точек,
 * после чего окно может сужаться, если разница в высотах Y точек выше заданного порога.
 * 
 * Фильтр улучшен путем итеративного сужения интервала обработки до достижения заданного
 * критерия по высоте Y. Это позволяет повысить точность и представительность
 * медианных значений за счет исключения аномальных значений и шума.
 * 
 * @param {IPoint[]} points - Массив точек для фильтрации.
 * @param {number} maxWindowSize - Максимальный размер окна для медианной фильтрации.
 * @param {number} maxLength - Максимальная длина интервала для одного окна фильтрации.
 * @param {number} thresholdYDiff - Порог разницы в высоте Y для рекурсивного уточнения.
 * @param {number} recursionLevel - Текущий уровень рекурсии (используется внутри функции).
 * @returns {IPoint[]} Отфильтрованный набор точек.
 */
const enhancedMedianFilter: IFilter = (points: IPoint[], maxWindowSize: number = 10, maxLength: number = 0.05, thresholdYDiff: number = 0.05, recursionLevel: number = 0): IPoint[] => {
  const filteredPoints: IPoint[] = [];

  let i = 0;
  let maxYDiff = 0;

  while (i < points.length) {
    let windowSize = 1;
    while (windowSize < Math.min(maxWindowSize, points.length - i) && 
           Math.abs(points[i + windowSize].x - points[i].x) <= maxLength) {
      windowSize++;
    }

    const windowPoints = points.slice(i, i + windowSize);
    const medianX = getMedian(windowPoints.map(p => p.x));
    const medianY = getMedian(windowPoints.map(p => p.y));
    maxYDiff = Math.max(maxYDiff, Math.abs(medianY - points[i].y));

    filteredPoints.push({ x: medianX, y: medianY });

    i += windowSize; // Move to the next window
  }

  // Check if we need to recurse
  console.log(`${(maxYDiff > thresholdYDiff && recursionLevel < 10)}`)
  if (maxYDiff > thresholdYDiff && recursionLevel < 10) {

    console.log(recursionLevel);
    return enhancedMedianFilter(filteredPoints, maxWindowSize, maxLength, thresholdYDiff, recursionLevel + 1);
  }

  return filteredPoints;
};

const getMedian = (values: number[]): number => {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export default enhancedMedianFilter;
