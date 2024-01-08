import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

const filterXRange: IFilter = (points: IPoint[], minX: number, maxX: number): IPoint[] => {
  // Filter the points to keep only those within the specified X-axis range
  const filteredPoints = points.filter(point => point.x >= minX && point.x <= maxX);

  return filteredPoints;
};

export default filterXRange;
