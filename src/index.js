import './util/polyfills';
import './util/moveTo';
import layout from './layout';
import dataPrep from './dataPrep';
import makeScales from './makeScales';
import { draw as drawChart } from './draw/draw';

export default function forestPlot(data, element = 'body', settings) {
    console.log(settings);
    let chart = {
        raw: data,
        element: element,
        config: settings
    };

    layout.call(chart);
    dataPrep.call(chart);
    makeScales.call(chart);
    drawChart.call(chart);
}
