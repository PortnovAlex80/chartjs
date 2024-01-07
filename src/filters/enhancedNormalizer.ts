import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';

const enhancedNormalizer: IFilter = (points: IPoint[], maxLength: number = 1, step: number = 0.05): IPoint[] => {
  const fineCubePolynomialApproximation = new CubicPolynomialApproximation();
  const normalizedPoints: IPoint[] = [];
  const thresholdRMSE = 0.05;

  let i = 0;
  while (i < points.length) {
    // Определение размера окна на основе евклидова расстояния
    let j = i;
    let lastValidJ = i;

    while (j < points.length && distance(points[i], points[j]) <= maxLength) {
      j++;
    }

    const windowPoints = points.slice(i, j);
    const approximatedPoints = fineCubePolynomialApproximation.approximate(windowPoints);

    const segmentRMSE = fineCubePolynomialApproximation.calculateRMSE();
    console.log(segmentRMSE);

    while (j < points.length) {
      let segment = points.slice(i, j + 1);
      fineCubePolynomialApproximation.approximate(segment);
      const segmentRMSE = fineCubePolynomialApproximation.calculateRMSE();
      console.log(segmentRMSE);
      if (segmentRMSE < thresholdRMSE) {
        lastValidJ = j; // Обновляем последний допустимый индекс
        j++;
      } else {
        break;
      }
    }

    // Аппроксимация лучшего сегмента и добавление точек
let finalSegment = points.slice(i, lastValidJ + 1);
fineCubePolynomialApproximation.approximate(finalSegment);
for (let x = finalSegment[0].x; x <= finalSegment[finalSegment.length - 1].x; x += step) {
  const y = fineCubePolynomialApproximation.getY(x);
  normalizedPoints.push({ x, y });
}

i = lastValidJ + 1; // Переход к следующему окну


  }

  return normalizedPoints;
};

// Функция для вычисления евклидова расстояния между двумя точками
function distance(p1: IPoint, p2: IPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export default enhancedNormalizer;



// import { IPoint } from '../interfaces/IPoint';
// import { IFilter } from '../interfaces/IFilter';
// import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';

// const enhancedNormalizer: IFilter = (points: IPoint[], thresholdRMSE: number = 0.05, step: number = 0.1, minLength: number = 1): IPoint[] => {
//   const fineCubePolynomialApproximation = new CubicPolynomialApproximation();
//   const normalizedPoints: IPoint[] = [];
//   let i = 0;

//   while (i < points.length) {
//     let j = i + 1;
//     let lastValidJ = i;

//     // добираем мин длину
//     while (j < points.length && distance(points[i], points[j]) <= minLength) {
//       j++;
//     }

//     while (j < points.length) {
//       let segment = points.slice(i, j + 1);
//       fineCubePolynomialApproximation.approximate(segment);
//       const segmentRMSE = fineCubePolynomialApproximation.calculateRMSE();
//       console.log(segmentRMSE);
//       if (segmentRMSE < thresholdRMSE) {
//         lastValidJ = j; // Обновляем последний допустимый индекс
//         j++;
//       } else {
//         break;
//       }
//     }

// // Аппроксимация лучшего сегмента и добавление точек
// let finalSegment = points.slice(i, lastValidJ + 1);
// fineCubePolynomialApproximation.approximate(finalSegment);
// for (let x = finalSegment[0].x; x <= finalSegment[finalSegment.length - 1].x; x += step) {
//   const y = fineCubePolynomialApproximation.getY(x);
//   normalizedPoints.push({ x, y });
// }

// i = lastValidJ + 1; // Переход к следующему окну
//   }

//   return normalizedPoints;
// };

// // Функция для вычисления евклидова расстояния между двумя точками
// function distance(p1: IPoint, p2: IPoint): number {
//   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
// }

// export default enhancedNormalizer;
