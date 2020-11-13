export function draw() {
    let chart = this;
    let data = chart.raw;
    let groups = chart.config.groups;
    let pairs = chart.config.pairs;

    chart.table.selectAll('*').remove();
    chart.head = chart.table.append('thead').style('text-align', 'center');
    chart.head1 = chart.head.append('tr');
    chart.head1.append('th');
    chart.head1.append('th');
    chart.head1
        .append('th')
        .text('Incidence')
        .attr('colspan', groups.length + 1);
    chart.head1
        .append('th')
        .text('Comparisons')
        .attr('colspan', pairs.length + 1);

    chart.head2 = chart.head.append('tr');
    chart.head2.append('th').text('System Organ Class');
    chart.head2.append('th').text('Preferred Term');
    chart.head2
        .selectAll('th.group')
        .data(groups)
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
        .data(pairs)
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

    let table = $('.forestplot table')
        .DataTable({
            dom: '<"top"if>rt<"clear">',
            paging: false,
            order: [[2, 'desc']],
            columnDefs: [
                { width: '120px', targets: 2 + chart.config.groups.length },
                {
                    width: '300px',
                    targets: 2 + chart.config.groups.length + 1 + chart.config.pairs.length
                }
            ]
        })
        .columns.adjust()
        .draw();

    // make controls
    let indidenceControl = chart.controls.append('div').attr('class', 'slider-wrap');
    let maxPercent = Math.ceil(chart.groupScale.domain()[1]);
    indidenceControl
        .append('label')
        .attr('id', 'incidence-label')
        .text('Incidence: ');
    indidenceControl
        .append('span')
        .attr('id', 'incidence-vals')
        .attr('class', 'label')
        .text('0 - ' + maxPercent);
    indidenceControl.append('div').attr('id', 'incidence-slider');
    chart.config.incidenceFilter = [0, maxPercent];
    $('#incidence-slider').slider({
        range: true,
        min: 0,
        max: maxPercent,
        values: [0, maxPercent],
        slide: function(event, ui) {
            d3.select('#incidence-vals').text(ui.values[0] + ' - ' + ui.values[1]);
            chart.config.incidenceFilter = ui.values;
            table.draw();
        }
    });

    let compControl = chart.controls.append('div').attr('class', 'slider-wrap');
    let maxOR = Math.ceil(chart.orScale.domain()[1]);
    compControl
        .append('label')
        .attr('id', 'comp-label')
        .text('Comparisons: ');
    compControl
        .append('span')
        .attr('id', 'comp-vals')
        .attr('class', 'label')
        .text('0 - ' + maxOR);
    compControl.append('div').attr('id', 'comp-slider');
    chart.config.compFilter = [0, maxOR];
    $('#comp-slider').slider({
        range: true,
        min: 0,
        max: maxOR,
        values: [0, maxOR],
        slide: function(event, ui) {
            d3.select('#comp-vals').text(ui.values[0] + ' - ' + ui.values[1]);
            chart.config.compFilter = ui.values;
            table.draw();
        }
    });

    // Search on rates
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        let incidence_vals = data.filter(function(d, i) {
            let first_col = 2;
            let last_col = first_col + groups.length;
            return (i >= first_col) & (i < last_col);
        });
        let incidence_max = d3.max(incidence_vals, d => +d);
        let incidence_flag =
            (incidence_max >= chart.config.incidenceFilter[0]) &
            (incidence_max <= chart.config.incidenceFilter[1]);

        let comp_vals = data.filter(function(d, i) {
            let first_comp = 2 + groups.length + 1;
            let last_comp = first_comp + pairs.length;
            return (i >= first_comp) & (i < last_comp);
        });
        let comp_max = d3.max(comp_vals, d => (d == '-' ? 0 : +d));
        let comp_flag =
            (comp_max >= chart.config.compFilter[0]) & (comp_max <= chart.config.compFilter[1]);

        return comp_flag & incidence_flag;
    });
}
