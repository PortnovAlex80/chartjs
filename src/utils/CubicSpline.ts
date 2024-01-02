// src/utils/CubicSpline.ts
export class CubicSpline {
    private xs: number[];
    private ys: number[];
    private ks: number[];

    constructor(xs: number[], ys: number[]) {
        this.xs = xs;
        this.ys = ys;
        this.ks = this.computeNaturalKs(xs, ys);
    }

    private computeNaturalKs(xs: number[], ys: number[]): number[] {
        const n = xs.length - 1;
        const A = new Array(n + 1).fill(0).map(() => new Array(n + 2).fill(0));
        const ks = new Array(n + 1).fill(0);

        for (let i = 1; i < n; i++) {
            A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
            A[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
            A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
            A[i][n + 1] = 3 * ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) ** 2) + (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) ** 2));
        }

        A[0][0] = 2 / (xs[1] - xs[0]);
        A[0][1] = 1 / (xs[1] - xs[0]);
        A[0][n + 1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) ** 2);

        A[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
        A[n][n] = 2 / (xs[n] - xs[n - 1]);
        A[n][n + 1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) ** 2);

        // Решение системы линейных уравнений для получения ks
        // Здесь можно использовать метод Гаусса или другие алгоритмы линейной алгебры
        this.solve(A, ks);
        
        return ks;
    }

    public at(x: number): number {
        if (x <= this.xs[0]) {
            return this.ys[0];
        }

        if (x >= this.xs[this.xs.length - 1]) {
            return this.ys[this.ys.length - 1];
        }

        let i = this.getIndexBefore(x);
        const t = (x - this.xs[i - 1]) / (this.xs[i] - this.xs[i - 1]);
        const a = this.ks[i - 1] * (this.xs[i] - this.xs[i - 1]) - (this.ys[i] - this.ys[i - 1]);
        const b = -this.ks[i] * (this.xs[i] - this.xs[i - 1]) + (this.ys[i] - this.ys[i - 1]);
        const q = (1 - t) * this.ys[i - 1] + t * this.ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
        return q;
    }

    private getIndexBefore(x: number): number {
        let low = 0;
        let high = this.xs.length - 1;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.xs[mid] < x) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return Math.max(1, low);
    }

    private swapRows(A: number[][], i: number, j: number): void {
        [A[i], A[j]] = [A[j], A[i]];
      }
      
    private solve(A: number[][], ks: number[]): number[] {
        const m = A.length;
        let h = 0;
        let k = 0;
        while (h < m && k <= m) {
          let i_max = 0;
          let max = -Infinity;
          for (let i = h; i < m; i++) {
            const v = Math.abs(A[i][k]);
            if (v > max) {
              i_max = i;
              max = v;
            }
          }
      
          if (A[i_max][k] === 0) {
            k++;
          } else {
            this.swapRows(A, h, i_max);
            for (let i = h + 1; i < m; i++) {
              const f = A[i][k] / A[h][k];
              A[i][k] = 0;
              for (let j = k + 1; j <= m; j++) A[i][j] -= A[h][j] * f;
            }
            h++;
            k++;
          }
        }
      
        for (let i = m - 1; i >= 0; i--) {
          var v = 0;
          if (A[i][i]) {
            v = A[i][m] / A[i][i];
          }
          ks[i] = v;
          for (let j = i - 1; j >= 0; j--) {
            A[j][m] -= A[j][i] * v;
            A[j][i] = 0;
          }
        }
        return ks;
      }
    

}

