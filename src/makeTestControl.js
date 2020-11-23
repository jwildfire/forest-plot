export default function makeTestControl() {
    let tests = this.anly.map(m => m.key);
    let wrap = this.controls.append('div').attr('class', 'slider-wrap');

    wrap.append('span')
        .attr('class', 'label')
        .text('Select Test');
    wrap.append('br');
    let test_control = wrap.append('select');
    test_control
        .selectAll('option')
        .data(tests)
        .enter('append')
        .append('option')
        .text(d => d);
    test_control.on('change', function() {
        let current = this.value;
        d3.selectAll('div.tableWrap').classed('hidden', d => d != current);
    });
}
