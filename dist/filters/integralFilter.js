const integralFilter = (points) => {
    let integral = 0;
    const integralPoints = [{ x: points[0].x, y: 0 }];
    for (let i = 0; i < points.length - 1; i++) {
        // Вычисление площади трапеции
        const base = points[i + 1].x - points[i].x;
        const height = (points[i + 1].y + points[i].y) / 2;
        integral += base * height;
        // Добавление точки (x, интеграл до x)
        integralPoints.push({ x: points[i + 1].x, y: integral });
    }
    return integralPoints;
};
export default integralFilter;
