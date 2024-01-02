function randomContrastColor() {
    const hue = Math.floor(Math.random() * 360); // Случайный оттенок от 0 до 359
    return `hsl(${hue}, 100%, 50%)`; // 100% насыщенность и 50% светлость
}
export default function visualDatasetBuilder(...dataSets) {
    return dataSets.map(dataSets => {
        const borderColor = dataSets.borderColor || randomContrastColor();
        return Object.assign(Object.assign({}, dataSets), { options: Object.assign(Object.assign({}, dataSets), { borderColor: borderColor || randomContrastColor(), pointBackgroundColor: borderColor, pointBorderColor: randomContrastColor() }) });
    });
}
