export default function makeControls() {
    let chart = this;
    let config = this.config;
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
            let last_col = first_col + config.groups.length;
            return (i >= first_col) & (i < last_col);
        });
        let incidence_max = d3.max(incidence_vals, d => +d);
        let incidence_flag =
            (incidence_max >= chart.config.incidenceFilter[0]) &
            (incidence_max <= chart.config.incidenceFilter[1]);

        let comp_vals = data.filter(function(d, i) {
            let first_comp = 2 + config.groups.length + 1;
            let last_comp = first_comp + config.pairs.length;
            return (i >= first_comp) & (i < last_comp);
        });
        let comp_max = d3.max(comp_vals, d => (d == '-' ? 0 : +d));
        let comp_flag =
            (comp_max >= chart.config.compFilter[0]) & (comp_max <= chart.config.compFilter[1]);

        return comp_flag & incidence_flag;
    });
}
