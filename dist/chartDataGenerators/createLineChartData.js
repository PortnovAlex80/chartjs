export function createLineChartData(dataSets) {
    if (dataSets.length === 0) {
        return { labels: [], datasets: [] };
    }
    return {
        labels: dataSets[0].data.map((_, index) => `${index + 1}`),
        datasets: dataSets
    };
}
