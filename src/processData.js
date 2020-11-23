import { group } from 'd3';

export default function processData() {
    let chart = this;
    let config = this.config;

    //get list of all groups
    let allgroups = d3.merge(
        chart.raw.map(function(m) {
            return [
                { group: m[config.group1_col], count: m[config.denominator1_col] },
                { group: m[config.group2_col], count: m[config.denominator2_col] }
            ];
        })
    );

    let group_names = d3
        .set(allgroups.map(m => m.group))
        .values()
        .sort();

    config.groups = group_names.map(function(name) {
        let count = allgroups.filter(f => f.group == name)[0].count;
        return { group: name, count: +count };
    });

    //get list of all comparisons
    let allcomps = chart.raw.map(function(m) {
        let comp = m[config.group1_col] + ':' + m[config.group2_col];
        return comp;
    });

    config.pairs = d3
        .set(allcomps)
        .values()
        .sort();

    //make nested data for analysis
    this.anly = d3
        .nest()
        .key(f => f[config.test_col]) // group by test type
        .key(f => f[config.high_level_col] + ':' + f[config.low_level_col]) // and AE type
        .rollup(function(pt) {
            let groups = d3
                .nest()
                .key(f => f[config.group1_col])
                .rollup(function(d) {
                    return {
                        group: d[0][config.group1_col],
                        numerator: +d[0][config.numerator1_col],
                        denominator: +d[0][config.denominator1_col]
                    };
                })
                .entries(pt)
                .map(f => f.values);

            let comparison_groups = d3
                .nest()
                .key(f => f[config.group2_col])
                .rollup(function(d) {
                    return {
                        group: d[0][config.group2_col],
                        numerator: +d[0][config.numerator2_col],
                        denominator: +d[0][config.denominator2_col]
                    };
                })
                .entries(pt)
                .map(f => f.values);

            //add unused comparison groups to group list
            let group_names = groups.map(m => m.group);
            comparison_groups.forEach(function(comp_group) {
                if (group_names.indexOf(comp_group.group) == -1) {
                    groups.push(comp_group);
                }
            });

            // Add in missing groups using config
            let all_group_names = groups.map(m => m.group);
            config.groups.forEach(function(config_group) {
                if (all_group_names.indexOf(config_group.group) == -1) {
                    console.log(config_group.group + ' group is missing');
                    groups.push({
                        group: config_group.group,
                        numerator: 0,
                        denominator: config_group.count
                    });
                }
            });

            // calculate percents
            groups.forEach(function(g) {
                g.percent = g.numerator / g.denominator;
                g.percent_text = d3.format('0.1%')(g.percent);
            });

            groups.sort(function(a, b) {
                if (a.group < b.group) {
                    return -1;
                }
                if (a.group > b.group) {
                    return 1;
                }
                return 0;
            });

            // Get comparisons
            let comparisons = d3
                .nest()
                .key(f => f[config.group1_col] + ':' + f[config.group2_col])
                .entries(pt)
                .map(f => f.values[0]);

            comparisons.forEach(function(d) {
                d.comp = d[config.group1_col] + ':' + d[config.group2_col];
                d.result_text = d3.format('0.2f')(d[config.result_col]);
            });

            let comp_names = comparisons.map(
                comp => comp[config.group1_col] + ':' + comp[config.group2_col]
            );

            config.pairs.forEach(function(config_pair) {
                if (comp_names.indexOf(config_pair) == -1) {
                    console.log('pair is missing');
                    comparisons.push({
                        comp: config_pair,
                        result_text: '-'
                    });
                }
            });

            comparisons.sort(function(a, b) {
                if (a.comp < b.comp) {
                    return -1;
                }
                if (a.comp > b.comp) {
                    return 1;
                }
                return 0;
            });

            let shell = {
                high_level_cat: pt[0][config.high_level_col],
                low_level_cat: pt[0][config.low_level_col],
                group: groups,
                comparison: comparisons
            };
            return shell;
        })

        .entries(this.raw);
    console.log(this.anly);
}
