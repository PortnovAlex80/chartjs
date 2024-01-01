function randomContrastColor() {
    const hue = Math.floor(Math.random() * 360); // Случайный оттенок от 0 до 359
    return `hsl(${hue}, 100%, 50%)`; // 100% насыщенность и 50% светлость
}
export default function visualDatasetBuilder(...labeledDataSets) {
    return labeledDataSets.map(({ label, points }) => {
        return {
            label: label,
            data: points.map(point => ({ x: point.x, y: point.y })),
            borderColor: randomContrastColor(),
            borderWidth: 2,
            fill: true,
            showLine: false
        };
    });
}
