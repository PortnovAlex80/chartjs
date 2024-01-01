const orderByXFilter = (points) => {
    // Копируем массив, чтобы не изменять исходный
    const pointsCopy = [...points];
    // Сортируем точки по возрастанию координаты X
    pointsCopy.sort((a, b) => a.x - b.x);
    return pointsCopy;
};
export default orderByXFilter;
