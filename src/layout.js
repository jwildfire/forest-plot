export default function layout() {
    let chart = this;
    chart.wrap = d3.select(chart.element).attr('class', 'forestplot');
    chart.controls = d3
        .select(chart.element)
        .append('div')
        .attr('class', 'controls');
}
