import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

class KalmanFilter {
  public stateEstimate: number;   // Оценка состояния
  public errorCovariance: number; // Ковариация ошибки
  public processNoise: number;    // Шум процесса (неопределенность модели)
  public measurementNoise: number; // Шум измерения (погрешность съемки)

  constructor(initialState: number, initialErrorCovariance: number, processNoise: number, measurementNoise: number) {
    this.stateEstimate = initialState;
    this.errorCovariance = initialErrorCovariance;
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
  }

  update(measurement: number) {
    // Коррекция
    const kalmanGain = this.errorCovariance / (this.errorCovariance + this.measurementNoise);
    this.stateEstimate = this.stateEstimate + kalmanGain * (measurement - this.stateEstimate);
    this.errorCovariance = (1 - kalmanGain) * this.errorCovariance + this.processNoise;
  }
}

const kalmanFilter: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
  const filteredPoints: IPoint[] = [];
  const filter = new KalmanFilter(0, 1, 0.001, epsilon);

  points.forEach(point => {
    filter.update(point.y);
    filteredPoints.push({ x: point.x, y: filter.stateEstimate });
  });

  return filteredPoints;
};

export default kalmanFilter;
