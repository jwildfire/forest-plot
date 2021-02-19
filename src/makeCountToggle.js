export default function makeCountToggle() {
    let wrap = this.controls.insert('div', '*').attr('class', 'slider-wrap');
    let charts = this;
    let config = charts.config;
    wrap.append('span')
        .attr('class', 'label')
        .text('Show Rates');
    wrap.append('br');
    let test_control = wrap.append('input').attr('type', 'checkbox');
    test_control.on('change', function() {
        let current = this.checked;
        console.log('checkbox value is:');
        console.log(current);
        console.log(charts);
        charts.config.hideGroups = !this.checked;
        charts.anly.forEach(function(chart) {
            console.log(chart);
            chart.head1
                .selectAll('th.groupHead')
                .attr('colspan', config.hideGroups ? 1 : config.groups.length + 1);
            chart.head2.selectAll('th.group').classed('hidden', config.hideGroups);
            chart.body.selectAll('td.group-count').classed('hidden', config.hideGroups);
        });
    });
}
