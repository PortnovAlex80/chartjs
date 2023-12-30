// src/utils/pointFormatter.ts
import { IFormattedPoint } from '../interfaces/IFormattedPoint';
import { IPoint } from '../interfaces/IPoint';

const precision = 3; // Это значение можно изменить, чтобы настроить точность во всём проекте

export function formatPoint(point: IPoint): IFormattedPoint {
  return {
    x: point.x.toFixed(precision),
    y: point.y.toFixed(precision)
  };
}