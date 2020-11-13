export default function makeScales() {
    //define scales
    let chart = this;
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
        .domain(chart.config.groups);

    let all_percents = d3.merge(chart.raw.map(m => m.groups.map(n => n.percent)));
    let percent_extent = d3.extent(all_percents);
    chart.groupScale = d3.scale
        .linear()
        .range([10, 110])
        .domain(percent_extent);

    let all_ors = d3.merge(chart.raw.map(m => m.pairs.map(n => n.or)));
    let or_extent = d3.extent(all_ors);
    chart.orScale = d3.scale
        .linear()
        .range([10, 290])
        .domain([0, or_extent[1]]);
}
