export default function makeHeader() {
    let chart = this;
    let config = this.config;
    chart.head = chart.table.append('thead').style('text-align', 'center');
    chart.head1 = chart.head.append('tr');
    chart.head1.append('th');
    chart.head1.append('th');
    chart.head1
        .append('th')
        .text('Incidence')
        .attr('colspan', config.groups.length + 1);
    chart.head1
        .append('th')
        .text('Comparisons')
        .attr('colspan', config.pairs.length + 1);

    chart.head2 = chart.head.append('tr');
    chart.head2.append('th').text('System Organ Class');
    chart.head2.append('th').text('Preferred Term');
    chart.head2
        .selectAll('th.group')
        .data(config.groups)
        .enter()
        .append('th')
        .text(d => d);

    var groupAxis = d3.svg
        .axis()
        .scale(chart.groupScale)
        .ticks(6)
        .orient('top');
    chart.head2
        .append('th')
        .text('Rates')
        .attr('class', 'rates axis')
        .append('svg')
        .attr('height', 20)
        .attr('width', 120)
        .append('svg:g')
        .attr('class', 'axis percent')
        .attr('transform', 'translate(0,20)')
        .call(groupAxis);

    chart.head2
        .selectAll('th.pairs')
        .data(config.pairs)
        .enter()
        .append('th')
        .text(d => d[0] + ' vs.' + d[1]);
    var orAxis = d3.svg
        .axis()
        .scale(chart.orScale)
        .ticks(6)
        .orient('top');

    chart.head2
        .append('th')
        .text('Comparison')
        .attr('class', 'diffs axis')
        .append('svg')
        .attr('height', '20')
        .attr('width', 300)
        .append('svg:g')
        .attr('class', 'axis percent')
        .attr('transform', 'translate(0,20)')
        .call(orAxis);
}
