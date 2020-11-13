import makeBody from './makeBody';
import makeHeader from './makeHeader';
import makeControls from './makeControls';

export function draw() {
    let chart = this;

    chart.table.selectAll('*').remove();
    makeHeader.call(this);
    makeBody.call(this);
    makeControls.call(this);

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
}
