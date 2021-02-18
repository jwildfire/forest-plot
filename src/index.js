import './util/polyfills';
import './util/moveTo';
import layout from './layout';
import makeScales from './draw/makeScales';
import { draw as drawChart } from './draw/draw';
import processData from './processData';
import makeFilterControls from './draw/makeFilterControls';
import makeTestControl from './makeTestControl';
import makeCountToggle from './makeCountToggle';

export default function forestPlot(data, element = 'body', settings) {
    console.log(settings);
    let chart = {
        raw: data,
        element: element,
        config: settings
    };

    layout.call(chart);
    processData.call(chart);
    makeScales.call(chart);
    makeTestControl.call(chart);
    drawChart.call(chart);
    makeFilterControls.call(chart, chart.anly[0]);
    makeCountToggle.call(chart);
}
