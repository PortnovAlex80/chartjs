export function createScatterChartData(dataSets) {
    return {
        datasets: dataSets.map(dataset => {
            const scatterData = dataset.data.map(entry => ({
                x: parseFloat(entry.x.toString()),
                y: parseFloat(entry.y.toString())
            }));
            return {
                label: dataset.label,
                borderColor: dataset.borderColor,
                borderWidth: 2,
                data: scatterData,
                pointBackgroundColor: dataset.borderColor,
                pointBorderColor: dataset.borderColor,
                pointRadius: 2,
                fill: false,
                tension: 0,
                showLine: true
            };
        })
    };
}
