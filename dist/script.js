var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/script.ts
import { createLineChartData } from './chartDataGenerators/createLineChartData.js';
import { createScatterChartData } from './chartDataGenerators/createScatterChartData.js';
function loadData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("START SCRIpt");
        try {
            const response = yield fetch('/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            const chartType = "scatter"; // 'line'-'scatter'
            let chartData;
            switch (chartType) {
                case "line":
                    chartData = createLineChartData(data);
                    break;
                case "scatter":
                    chartData = createScatterChartData(data);
                    break;
                default:
                    throw new Error('Неизвестный тип графика');
            }
            const canvas = document.getElementById('myChart');
            if (!canvas) {
                throw new Error('Элемент canvas не найден');
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Не удалось получить контекст для canvas');
            }
            new Chart(ctx, {
                type: chartType,
                data: chartData,
                options: {},
            });
        }
        catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    });
}
window.addEventListener('load', loadData);
