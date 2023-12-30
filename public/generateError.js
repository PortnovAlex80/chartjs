// Функция для генерации случайного числа в пределах от -0.1 до 0.1 (погрешность 10 см)
function generateError() {
    return (Math.random() - 0.5) * 0.2; // Генерируем от -0.1 до 0.1
  }
  
  // Функция для генерации координат точек на прямой
  function generatePoints() {
    const points = [];
    let x = 0; // Начальная координата X
    const step = 1; // Шаг 1 метр
    const length = 100; // Длина отрезка 100 метров
    const precision = 3; // Точность 3 знака после запятой
  
    for (let i = 0; i <= length; i++) {
      const errorX = generateError(); // Погрешность по X
      const errorY = generateError(); // Погрешность по Y
  
      const point = {
        x: (x + errorX).toFixed(precision),
        y: (errorY).toFixed(precision),
      };
  
      points.push(point);
      x += step; // Увеличиваем X на 1 метр
    }
  
    return points;
  }
  
  const points = generatePoints();
  console.log(points);
  