// Start with

function processData(raw) {
    let anly = d3
        .nest()
        .key(f => f.Test) // group by test type
        .key(f => f.AEBODSYS + ':' + f.AEDECOD) // and AE type
        .rollup(function(pt) {
            let groups = d3
                .nest()
                .key(f => f.Group1)
                .rollup(function(d) {
                    return {
                        group: d[0].Group1,
                        numerator: d[0].n1,
                        denominator: d[0].N1
                    };
                })
                .entries(pt)
                .map(f => f.values);

            let comparison_groups = d3
                .nest()
                .key(f => f.Group2)
                .rollup(function(d) {
                    return {
                        group: d[0].Group2,
                        numerator: d[0].n2,
                        denominator: d[0].N2
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

            comparisons = d3
                .nest()
                .key(f => f.Group1 + ':' + f.Group2)
                .entries(pt)
                .map(f => f.values);

            let shell = {
                AEDECOD: pt[0].AEDECOD,
                AEBODSYS: pt[0].AEBODSYS,
                group: groups,
                comparison: comparisons
            };
            return shell;
        })
        .entries(raw);

    return anly;
}
