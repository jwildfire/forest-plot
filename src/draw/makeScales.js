import { group } from 'd3';

export default function makeScales() {
    let chart = this;
    let config = this.config;

    chart.colorScale = d3.scale
        .ordinal()
        .range([
            '#999',
            '#e41a1c',
            '#377eb8',
            '#4daf4a',
            '#984ea3',
            '#ff7f00',
            '#ffff33',
            '#a65628',
            '#f781bf'
        ])
        .domain(chart.config.groups.map(m => m.group));

    //Rate Scale - shared across tests
    let all_percents = chart.raw.map(function(m) {
        let num1 = +m.n1;
        let num2 = +m.n2;
        let denom1 = +m.N1;
        let denom2 = +m.N2;
        let percent1 = num1 / denom1;
        let percent2 = num2 / denom2;
        return [percent1, percent2];
    });
    let percent_extent = d3.extent(d3.merge(all_percents));

    chart.rateScale = d3.scale
        .linear()
        .range([10, 110])
        .domain(percent_extent);

    //Test scale - defined for each test
    chart.anly.forEach(function(testData) {
        console.log(testData);
        let all_comparisons = d3.merge(testData.values.map(m => m.values.comparison));
        console.log(all_comparisons);
        let all_upper = all_comparisons.map(m => +m[config.result_upper_col]);
        let all_lower = all_comparisons.map(m => +m[config.result_lower_col]);
        console.log(all_upper);
        let testExtent = [d3.min(all_lower), d3.max(all_upper)];
        //let testExtent = [0, d3.max(all_upper)];
        console.log(testExtent);
        testData.testScale = d3.scale
            .linear()
            .range([10, 290])
            .domain(testExtent);
    });
}
