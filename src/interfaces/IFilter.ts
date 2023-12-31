// src/interfaces/IFilter.ts
import { IPoint } from './IPoint';

export interface IFilter {
  (points: IPoint[], ...args: any[]): IPoint[];
}
