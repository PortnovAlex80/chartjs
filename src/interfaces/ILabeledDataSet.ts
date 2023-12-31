// src/interfaces/ILabeledDataSet.ts
import { IPoint } from './IPoint';

export interface ILabeledDataSet {
    label: string;
    points: IPoint[];
}
