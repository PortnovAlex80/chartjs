// src/interfaces/IDataSet.ts
import { IPoint } from "./IPoint";

export interface IDataSet {
    data: IPoint[];
    borderColor: string; // Обязательное поле для цвета
    // Опциональные поля для дополнительных свойств визуализации
    label?: string; // Опциональное свойство для названия датасета
    borderWidth?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointRadius?: number;
    fill?: boolean;
    tension?: number;
    showLine?: boolean;
    // ... другие опциональные свойства ...
  }