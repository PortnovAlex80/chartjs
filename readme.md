# Графики на основе данных из CSV с использованием Chart.js и Node.js

## Описание

Проект представляет собой веб-приложение для отображения графиков, данные для которых берутся из CSV файла. Используется Chart.js для отображения графиков и Node.js для бэкенд логики.

## Структура папок

- `/public` - папка для статических файлов (HTML, JS, CSS).
- `/public/dist` - папка для собранных файлов Webpack.
- `/geodetic` - папка с модулями для генерации и обработки данных.
- `/filters` - папка с модулями фильтров и алгоритмов обработки данных.
- `server.js` - основной файл сервера Node.js.
- `webpack.config.js` - конфигурация для Webpack.

## Установка

1. Установите Node.js и npm.
2. Клонируйте репозиторий: `git clone [URL репозитория]`.
3. Перейдите в папку проекта: `cd [имя_папки]`.
4. Установите зависимости: `npm install`.

## Запуск

- Запуск сервера: `npm start`.
- Сборка проекта с помощью Webpack: `npm run build`.

## Использование Webpack

Webpack используется для сборки модулей JavaScript. Конфигурация Webpack находится в файле `webpack.config.js`. Для добавления новых модулей или изменения настроек сборки вносите соответствующие изменения в этот файл.

## Добавление и модификация алгоритмов и фильтров

1. Для добавления нового алгоритма или фильтра создайте соответствующий модуль в папке `/filters`. Новый фильтр или алгоритм должен принимать массив точек в формате `{ x: number, y: number }` и возвращать массив точек в том же формате.
2. Импортируйте и применяйте новый алгоритм или фильтр в модуле `/public/ChartDataAggregator.js`. Убедитесь, что входные и выходные данные соответствуют требуемому формату точек.
3. Для интеграции алгоритма или фильтра в график, модифицируйте функцию `ChartDataAggregator` так, чтобы она включала результаты работы нового алгоритма или фильтра. Это позволит автоматически интегрировать результаты в графики, отображаемые на веб-странице.


## Примечания

- Для корректной работы браузера убедитесь, что путь к исполняемому файлу Chromium верен и соответствует вашей системе.
- В коде предусмотрена автоматическая очистка процесса Chromium при закрытии сервера.
