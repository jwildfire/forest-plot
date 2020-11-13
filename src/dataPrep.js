// data prep
export default function dataPrep() {
    let chart = this;
    console.log(chart);
    chart.raw.forEach(function(d) {
        d.groups = chart.config.groups.map(function(group) {
            return {
                key: group,
                percent: d[group + '_percent'],
                n: d[group + '_n'],
                total: d[group + '_total']
            };
        });
        d.pairs = chart.config.pairs.map(function(pair) {
            let pair_id = pair[0] + '_' + pair[1];
            return {
                key: pair_id,
                group1: pair[0],
                group2: pair[1],
                label: pair[0] + ' vs. ' + pair[1],
                or: d[pair_id + '_or'],
                p: d[pair_id + '_pval']
            };
        });
    });
    console.log(chart.raw);
}
