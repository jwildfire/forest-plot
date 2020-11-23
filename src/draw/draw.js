import makeBody from './makeBody';
import makeHeader from './makeHeader';

export function draw() {
    let chart = this;

    chart.anly.forEach(function(testData, i) {
        testData.wrap = chart.wrap
            .append('div')
            .attr('class', 'tableWrap')
            .classed('hidden', i > 0)
            .datum(testData.key);
        testData.wrap.append('h2').text(testData.key);
        testData.table = testData.wrap.append('table').attr('class', 'table ae-table table' + i);
        makeHeader.call(chart, testData);
        makeBody.call(chart, testData);
        $('.forestplot .tableWrap .table' + i)
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
    });
}
