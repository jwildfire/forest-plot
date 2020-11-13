export default function makeBody() {
    let chart = this;
    chart.body = chart.table.append('tbody');
    chart.rows = chart.body
        .selectAll('tr')
        .data(chart.raw)
        .enter()
        .append('tr');
    chart.rows
        .append('td')
        .attr('class', 'soc')
        .text(d => (d.soc.length > 25 ? d.soc.substring(0, 25) + '...' : d.soc))
        .attr('title', d => d.soc);
    chart.rows
        .append('td')
        .attr('class', 'term')
        .text(d => (d.term.length > 25 ? d.term.substring(0, 25) + '...' : d.term))
        .attr('title', d => d.term);

    //Group Counts
    chart.rows
        .selectAll('td.group-count')
        .data(d => d.groups)
        .enter()
        .append('td')
        .attr('class', 'group-count')
        .style('text-align', 'center')
        .text(d => d.percent)
        .attr('title', d => d.n + '/' + d.total)
        .style('cursor', 'help')
        .style('color', d => chart.colorScale(d.key));

    //group plot
    chart.groupPlot = chart.rows
        .append('td')
        .attr('class', 'group-plot plot')
        .append('svg')
        .attr('height', 20)
        .attr('width', 120);
    chart.groupPlot
        .selectAll('circle')
        .data(d => d.groups)
        .enter()
        .append('circle')
        .attr('cx', d => chart.groupScale(d.percent))
        .attr('cy', 10)
        .attr('r', 5)
        .attr('stroke', d => chart.colorScale(d.key))
        .attr('fill', d => chart.colorScale(d.key))
        .style('cursor', 'help')
        .append('title')
        .text(d => d.key + ': ' + d.percent + '% (' + d.n + '/' + d.total + ')');

    //Group Comparisons
    chart.rows
        .selectAll('td.compare')
        .data(d => d.pairs)
        .enter()
        .append('td')
        .attr('class', 'compare')
        .style('text-align', 'center')
        .text(d => (d.or ? d.or : '-'))
        .attr('title', d => 'p=' + d.p)
        .style('font-weight', d => (d.p < 0.05 ? 'bold' : null))
        .style('color', d => (d.p < 0.05 ? 'black' : '#ccc'));

    var diffPlots = chart.rows
        .append('td')
        .attr('class', 'diffplot plot')
        .append('svg')
        .attr('height', 20)
        .attr('width', 300)
        .append('g');

    var diffPoints = diffPlots
        .selectAll('g')
        .data(d => d.pairs.filter(f => f.or))
        .enter()
        .append('g');
    diffPoints.append('title').text(d => d.label + ': ' + d.or + ' (p=' + d.p + ')');
    //Append graphical rate differences.
    var triangle = d3.svg
        .line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate('linear-closed');

    diffPoints
        .append('svg:path')
        .attr('d', function(d) {
            var h = 20,
                r = 5;

            var leftpoints = [
                { x: chart.orScale(d.or), y: h / 2 + r }, //bottom
                { x: chart.orScale(d.or) - r, y: h / 2 }, //middle-left
                { x: chart.orScale(d.or), y: h / 2 - r } //top
            ];
            return triangle(leftpoints);
        })
        .attr('class', 'diamond')
        .attr('fill-opacity', function(d) {
            return d.p < 0.05 ? 1 : 0.1;
        })
        .attr('fill', d => chart.colorScale(d.group1))
        .attr('stroke', d => chart.colorScale(d.group1))
        .attr('stroke-opacity', 0.3);

    diffPoints
        .append('svg:path')
        .attr('d', function(d) {
            let h = 20;
            let r = 5;

            var rightpoints = [
                { x: chart.orScale(d.or), y: h / 2 + r }, //bottom
                { x: chart.orScale(d.or) + r, y: h / 2 }, //middle-right
                { x: chart.orScale(d.or), y: h / 2 - r } //top
            ];
            return triangle(rightpoints);
        })
        .attr('class', 'diamond')
        .attr('fill-opacity', function(d) {
            return d.p < 0.05 ? 1 : 0.1;
        })
        .attr('fill', d => chart.colorScale(d.group2))
        .attr('stroke', d => chart.colorScale(d.group2))
        .attr('stroke-opacity', 0.3);
}
