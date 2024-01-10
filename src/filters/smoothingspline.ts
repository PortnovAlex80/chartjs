// src/filters/smoothingspline.ts
// import math, { Matrix, index, subset } from 'mathjs';
import * as math from 'mathjs';
import { Matrix, index, subset } from 'mathjs';



type Index = number;
type Size = number;
export type DoubleArray = number[];
type DoubleArray2D = number[][];
type IndexArray = number[];


interface DoubleSparseMatrix {
    // Структура для представления разреженной матрицы (здесь подробности опущены)
}

export class UnivariateCubicSmoothingSpline {
    private m_xdata: DoubleArray;
    private m_ydata: DoubleArray;
    private m_weights: DoubleArray;
    private m_smooth: number;
    private m_coeffs: DoubleArray2D | null = null; // Явная инициализация

    constructor(xdata: DoubleArray, ydata: DoubleArray, weights?: DoubleArray, smooth?: number) {
        this.m_xdata = xdata;
        this.m_ydata = ydata;
        this.m_weights = weights || [];
        this.m_smooth = smooth || -1.0;
    
        // Реализация каждого конструктора может быть выполнена независимо
        this.makeSpline();
    }

    private makeSpline(): void {
        const pcount = this.m_xdata.length;
        const pcount_m1 = pcount - 1;
        const pcount_m2 = pcount - 2;
    
        const dx = diff(this.m_xdata);
        const dy = diff(this.m_ydata);
        const divdydx = dy.map((value, index) => value / dx[index]);
    
        let p = this.m_smooth;
    
        if (pcount > 2) {
            const n = dx.length - 1;
            let diags: DoubleArray2D = [[], [], []];
    
            const head_r = dx.slice(0, n);
            const tail_r = dx.slice(1);
    
            diags[0] = tail_r;
            diags[1] = head_r.map((value, index) => 2 * (value + tail_r[index]));
            diags[2] = head_r;
    
            let offsets: IndexArray = [-1, 0, 1];
    
            const r = makeSparseDiagMatrix(diags, offsets, pcount_m2, pcount_m2);
    
            const odx = dx.map(value => 1.0 / value);
            const head_qt = odx.slice(0, n);
            const tail_qt = odx.slice(1);
    
            diags[0] = head_qt;
            diags[1] = head_qt.map((value, index) => -(value + tail_qt[index]));
            diags[2] = tail_qt;
    
            offsets = [0, 1, 2];
    
            const qt = makeSparseDiagMatrix(diags, offsets, pcount_m2, pcount);
    
            const ow = this.m_weights.map(value => 1.0 / value);
            const osqw = this.m_weights.map(value => Math.sqrt(1.0 / value));
    
            offsets = [0];
    
            const w = makeSparseDiagMatrix([ow], offsets, pcount, pcount);
            const qw = makeSparseDiagMatrix([osqw], offsets, pcount, pcount);
    
            const qtw = math.multiply(qt, qw);
            const qtwq = math.multiply(qtw, math.transpose(qtw));


            const Trace = (m: Matrix): number => {
                let trace = 0;
                // Указываем, что size является массивом чисел
                const size = math.size(m).valueOf() as number[];
                for (let i = 0; i < size[0]; i++) {
                    trace += m.get([i, i]);
                }
                return trace;
            };
            
    
            let p = this.m_smooth;

            if (p < 0) {
                p = 1.0 / (1.0 + Trace(r) / (6.0 * Trace(qtwq)));
            }
    
            // Формируем матрицу A
            console.log('r:', r);
            console.log('qtwq:', qtwq);
            console.log('p:', p);
            

            const A = math.add(math.multiply(6 * (1 - p), qtwq), math.multiply(p, r));

            // Вектор b как матрица
            const b = math.matrix(diff(divdydx));
    
            // Решение линейной системы Ax = b
            const uMatrix = solveLinearSystem(A, b); // Предполагается, что solveLinearSystem возвращает матрицу
    
            // Преобразуем uMatrix в массив для дальнейших вычислений
            const u = uMatrix.valueOf() as number[];
    
            // Вычисляем d1
            let d1 = new Array(u.length + 2).fill(0);
            for (let i = 1; i <= u.length; i++) {
                d1[i] = u[i - 1];
            }
            d1 = diff(d1).map((value, index) => value / dx[index]);

            // Вычисляем d2
            let d2 = new Array(d1.length + 2).fill(0);
            for (let i = 1; i <= d1.length; i++) {
                d2[i] = d1[i - 1];
            }
            d2 = diff(d2);

            // Вычисляем yi
            const yi = this.m_ydata.map((value, index) => 
                value - 6 * (1 - p) * w.get([index, index]) * d2[index]
            );

            // Вычисляем c3
            let c3 = new Array(u.length + 2).fill(0);
            for (let i = 1; i <= u.length; i++) {
                c3[i] = p * u[i - 1];
            }

            // Вычисляем c2
            const c2 = diff(yi).map((value, index) => 
                value / dx[index] - dx[index] * (2 * c3[index] + c3[index + 1])
            );

            // Инициализируем и заполняем m_coeffs
            this.m_coeffs = new Array(pcount_m1).fill(null).map((_, i) => {
                const diffC3 = diff(c3).map((value, index) => value / dx[index]);
                const c3Head = c3.slice(0, pcount_m1).map(value => 3 * value);
                const yiHead = yi.slice(0, pcount_m1);

                return [
                    diffC3[i] ?? 0,  // Значения для первого столбца
                    c3Head[i],       // Значения для второго столбца
                    c2[i],           // Значения для третьего столбца
                    yiHead[i]        // Значения для четвертого столбца
                ];
            });
        } else {
            // Устанавливаем p равным 1.0
            p = 1.0;

            // Инициализируем m_coeffs с размером 1x2
            this.m_coeffs = [
                [divdydx[0], this.m_ydata[0]]
            ];
        }
        this.m_smooth = p;
    }

    public evaluate(xidata: DoubleArray): DoubleArray {
        const x_size: Size = this.m_xdata.length;
    
        const mesh: DoubleArray = this.m_xdata.slice(1, x_size - 1);
        const edges: DoubleArray = new Array(x_size);
    
        edges[0] = -Number.POSITIVE_INFINITY;
        mesh.forEach((value, index) => {
            edges[index + 1] = value;
        });
        edges[x_size - 1] = Number.POSITIVE_INFINITY;
    
        const indexes: IndexArray = digitize(xidata, edges);
    
        // Use 0 as the start index
        indexes.forEach((value, index, array) => {
            array[index] = value - 1;
        });
    
        const xi_size: Size = xidata.length;
    
        const xidata_loc: DoubleArray = new Array(xi_size);
        const yidata: DoubleArray = new Array(xi_size);
    
        for (let i = 0; i < xi_size; ++i) {
            const index: Index = indexes[i];
    
            // Go to local coordinates
            xidata_loc[i] = xidata[i] - this.m_xdata[index];
    
            // Check if m_coeffs is not null
            if (this.m_coeffs !== null) {
                // Initial values
                yidata[i] = this.m_coeffs[index][0];
            }
            
        }
    
        const coeffs: DoubleArray = new Array(xi_size);
    
        if (this.m_coeffs !== null) {
            for (let i = 1; i < this.m_coeffs[0].length; ++i) {
                for (let k = 0; k < xi_size; ++k) {
                    coeffs[k] = this.m_coeffs[indexes[k]]![i];
                }
        
                for (let j = 0; j < xi_size; ++j) {
                    let temp_sum: number = 0;
                    for (let k = 0; k < xi_size; ++k) {
                        temp_sum += xidata_loc[k] * yidata[k];
                    }
                    yidata[j] = temp_sum + coeffs[j];
                }
            }
        } else {
            // Обработка случая, когда this.m_coeffs равно null
            // Например, можно выбросить ошибку или предоставить значение по умолчанию
        }
        
        
    
        return yidata;
    }
    
    public getSmooth(): number {
        return this.m_smooth;
    }

    public getBreaks(): DoubleArray {
        return this.m_xdata;
    }

    public getCoeffs(): DoubleArray2D {
        if (this.m_coeffs === null) {
            throw new Error("Coefficients are not available until spline is created");
        }
        return this.m_coeffs;
    }

    public getPieces(): Size {
        if (this.m_coeffs === null) {
            throw new Error("Coefficients are not available until spline is created");
        }
        return this.m_coeffs.length;
    }
}


function diff(vec: DoubleArray): DoubleArray {
  const n = vec.length - 1;
  const diffArray: DoubleArray = new Array(n);

  for (let i = 0; i < n; i++) {
    diffArray[i] = vec[i + 1] - vec[i];
  }

  return diffArray;
}

function digitize(arr: DoubleArray, bins: DoubleArray): IndexArray {
  // Проверяем, что `arr` и `bins` монотонно возрастают

  const indexes: IndexArray = new Array(arr.length).fill(1);
  const prc = 1.e-8;

  const isInsideBin = (item: number, index: number): boolean => {
    const a = arr[item];
    const bl = bins[index - 1];
    const br = bins[index];

    // bins[i-1] <= a < bins[i]
    return (a > bl || Math.abs(a - bl) < Math.abs(Math.min(a, bl)) * prc) && a < br;
  };

  let kstart = 1;

  for (let i = 0; i < arr.length; i++) {
    for (let k = kstart; k < bins.length; k++) {
      if (isInsideBin(i, k)) {
        indexes[i] = k;
        kstart = k;
        break;
      }
    }
  }

  return indexes;
}

function solveLinearSystem(A: Matrix, b: Matrix): Matrix {
    // Предполагаем, что A - это квадратная матрица
    try {
      const x = math.lusolve(A, b);
      return x;
    } catch (error) {
      throw new Error('Не удалось решить линейную систему: ' + error);
    }
  }

function makeSparseDiagMatrix(diags: DoubleArray2D, offsets: IndexArray, rows: Size, cols: Size): Matrix {
  // Функция для получения количества элементов и индексов для разреженной матрицы
  const getNumElemsAndIndex = (offset: Index, rows: Size, cols: Size): [number, number, number] => {
    let i, j;
    if (offset < 0) {
      i = -offset;
      j = 0;
    } else {
      i = 0;
      j = offset;
    }
    return [Math.min(rows - i, cols - j), i, j];
  };

  // Создаем пустую разреженную матрицу
  let m: Matrix = math.matrix(math.zeros(rows, cols)) as Matrix;

  for (let k = 0; k < offsets.length; k++) {
    const offset = offsets[k];
    const [n, i, j] = getNumElemsAndIndex(offset, rows, cols);

    // Выбор элементов для диагонали
    let diag: number[] = [];
    if (offset < 0) {
      if (rows >= cols) {
        diag = diags[k].slice(0, n);
      } else {
        diag = diags[k].slice(diags[k].length - n);
      }
    } else {
      if (rows >= cols) {
        diag = diags[k].slice(diags[k].length - n);
      } else {
        diag = diags[k].slice(0, n);
      }
    }

    // Вставка элементов в матрицу
    for (let l = 0; l < n; l++) {
      m = subset(m, index(i + l, j + l), diag[l]);
    }
  }

  return m;
}

// function diff(vec: DoubleArray): DoubleArray
// function digitize(arr: DoubleArray, bins: DoubleArray): IndexArray 
// function solveLinearSystem(A: Matrix, b: Matrix): Matrix
// function makeSparseDiagMatrix(diags: DoubleArray2D, offsets: IndexArray, rows: Size, cols: Size): Matrix 
// private makeSpline(): void 