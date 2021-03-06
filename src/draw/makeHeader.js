export default function makeHeader(testData) {
    let chart = this;
    let config = this.config;
    let table = testData;
    let wrap = testData.table;

    table.head = wrap.append('thead').style('text-align', 'center');
    table.head1 = table.head.append('tr');
    table.head1.append('th');
    table.head1.append('th');
    table.head1
        .append('th')
        .text('Groups')
        .attr('class', 'groupHead')
        .attr('colspan', config.hideCounts ? 1 : config.groups.length + 1);
    table.head1
        .append('th')
        .text(testData.key)
        .attr('colspan', config.pairs.length + 1);

    table.head2 = table.head.append('tr');
    table.head2.append('th').text('System Organ Class');
    table.head2.append('th').text('Preferred Term');
    table.head2
        .selectAll('th.group')
        .data(config.groups)
        .enter()
        .append('th')
        .attr('class', 'group')
        .text(d => d.group)
        .classed('hidden', config.hideCounts);

    var rateAxis = d3.svg
        .axis()
        .scale(chart.rateScale)
        .ticks(3)
        .tickFormat(d => d * 100)
        .orient('top');

    table.head2
        .append('th')
        .text('Percentage')
        .attr('class', 'rates axis')
        .append('svg')
        .attr('height', 20)
        .attr('width', 120)
        .append('svg:g')
        .attr('class', 'axis percent')
        .attr('transform', 'translate(0,20)')
        .call(rateAxis);

    table.head2
        .selectAll('th.pairs')
        .data(config.pairs)
        .enter()
        .append('th')
        .text(d => d);
    var testAxis = d3.svg
        .axis()
        .scale(testData.testScale)
        .ticks(6)
        .orient('top');

    table.head2
        .append('th')
        .text('Comparison')
        .attr('class', 'diffs axis')
        .append('svg')
        .attr('height', '20')
        .attr('width', config.comparisonWidth)
        .append('svg:g')
        .attr('class', 'axis percent')
        .attr('transform', 'translate(0,20)')
        .call(testAxis);
}
