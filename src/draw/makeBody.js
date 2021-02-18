export default function makeBody(testData) {
    let chart = this;
    let config = this.config;
    let table = testData;
    let wrap = testData.table;
    console.log(testData);
    table.body = wrap.append('tbody');
    table.rows = table.body
        .selectAll('tr.value')
        .data(testData.values)
        .enter()
        .append('tr')
        .attr('class', 'value');
    table.rows
        .append('td')
        .attr('class', 'soc')
        .text(function(d) {
            let hl = d.values.high_level_cat;
            return hl.length > 25 ? hl.substring(0, 25) + '...' : hl;
        })
        .attr('title', d => d.values.high_level_cat);
    table.rows
        .append('td')
        .attr('class', 'term')
        .text(function(d) {
            let ll = d.values.low_level_cat;
            return ll.length > 25 ? ll.substring(0, 25) + '...' : ll;
        })
        .attr('title', d => d.values.low_level_cat);

    //Group Counts

    table.rows
        .selectAll('td.group-count')
        .data(d => d.values.group)
        .enter()
        .append('td')
        .attr('class', 'group-count')
        .style('text-align', 'center')
        .text(d => d.percent_text)
        .attr('title', d => d.numerator + '/' + d.denominator)
        .style('cursor', 'help')
        .style('color', d => chart.colorScale(d.group))
        .classed('hidden', config.hideCounts);

    //group plot
    table.groupPlot = table.rows
        .append('td')
        .attr('class', 'group-plot plot')
        .append('svg')
        .attr('height', 20)
        .attr('width', 120);
    table.groupPlot
        .selectAll('circle')
        .data(d => d.values.group)
        .enter()
        .append('circle')
        .attr('cx', d => chart.rateScale(d.percent))
        .attr('cy', 10)
        .attr('r', 5)
        .attr('stroke', d => chart.colorScale(d.group))
        .attr('fill', d => chart.colorScale(d.group))
        .style('cursor', 'help')
        .append('title')
        .text(
            d => d.group + ': ' + d.percent_text + ' (' + d.numerator + '/' + d.denominator + ')'
        );

    //Group Comparisons
    table.rows
        .selectAll('td.compare')
        .data(d => d.values.comparison)
        .enter()
        .append('td')
        .attr('class', 'compare')
        .style('text-align', 'center')
        .text(d => d.result_text)
        .attr(
            'title',
            d =>
                'p=' +
                d[config.p_col] +
                ', confidence interval=[' +
                d[config.result_lower_col] +
                ',' +
                d[config.result_upper_col] +
                ']'
        )
        .style('font-weight', d => (d[config.p_col] < 0.05 ? 'bold' : null))
        .style('color', d => (d[config.p_col] < 0.05 ? 'black' : '#ccc'));

    var diffPlots = table.rows
        .append('td')
        .attr('class', 'diffplot plot')
        .append('svg')
        .attr('height', d => 20 * d.values.comparison.filter(f => f.result_text != '-').length)
        .attr('width', 300)
        .append('g');

    var diffPoints = diffPlots
        .selectAll('g')
        .data(d =>
            d.values.comparison
                .filter(f => f.result_text != '-')
                .filter(function(d) {
                    return !isNaN(d[config.result_upper_col]);
                })
                .filter(function(d) {
                    return !isNaN(d[config.result_lower_col]);
                })
        )
        .enter()
        .append('g')
        .attr('class', 'diffg')
        .attr('transform', function(d, i) {
            return `translate(0, ${i * 15})`;
        })
        .attr('cursor', 'help');

    diffPoints
        .append('line')
        .attr('class', 'ci')
        .attr('x1', d => table.testScale(d[config.result_upper_col]))
        .attr('x2', d => table.testScale(d[config.result_lower_col]))
        .attr('y1', 20 / 2)
        .attr('y2', 20 / 2)
        .attr('stroke-width', '1px')
        .attr('stroke', 'black')
        .attr('opacity', '0.4');

    //diffPoints.append('title').text(d => d[config.group1_col]+" vs. " + ': ' + d.or + ' (p=' + d.p + ')');

    /* Append graphical rate differences.*/
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
                { x: table.testScale(d[config.result_col]), y: h / 2 + r }, //bottom
                { x: table.testScale(d[config.result_col]) - r, y: h / 2 }, //middle-left
                { x: table.testScale(d[config.result_col]), y: h / 2 - r } //top
            ];
            return triangle(leftpoints);
        })
        .attr('class', 'diamond')
        .attr('fill-opacity', function(d) {
            return d[config.p_col] < 0.05 ? 1 : 0.1;
        })
        .attr('fill', d => chart.colorScale(d[config.group1_col]))
        .attr('stroke', d => chart.colorScale(d[config.group2_col]))
        .attr('stroke-opacity', 0.3);

    diffPoints
        .append('svg:path')
        .attr('d', function(d) {
            let h = 20;
            let r = 5;

            var rightpoints = [
                { x: table.testScale(d[config.result_col]), y: h / 2 + r }, //bottom
                { x: table.testScale(d[config.result_col]) + r, y: h / 2 }, //middle-right
                { x: table.testScale(d[config.result_col]), y: h / 2 - r } //top
            ];
            return triangle(rightpoints);
        })
        .attr('class', 'diamond')
        .attr('fill-opacity', function(d) {
            return d[config.p_col] < 0.05 ? 1 : 0.1;
        })
        .attr('fill', d => chart.colorScale(d[config.group2_col]))
        .attr('stroke', d => chart.colorScale(d[config.group2_col]))
        .attr('stroke-opacity', 0.3);

    diffPoints.append('title').text(function(d) {
        let p = +d.Pvalue < 0.01 ? '<0.01' : '' + parseFloat(d.Pvalue).toFixed(2);
        return `${
            d.comp
        } - ${d.Test}: ${parseFloat(d.Res).toFixed(2)} [${parseFloat(d.CI_Lower).toFixed(2)}, ${parseFloat(d.CI_Upper).toFixed(2)}], p: ${p}`;
    });
}
