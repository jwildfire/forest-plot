(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory(require('d3')))
        : typeof define === 'function' && define.amd
        ? define(['d3'], factory)
        : ((global = global || self), (global.forestPlot = factory(global.d3)));
})(this, function(d3$1) {
    'use strict';

    if (typeof Object.assign != 'function') {
        Object.defineProperty(Object, 'assign', {
            value: function assign(target, varArgs) {
                if (target == null) {
                    // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) {
                        // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }

                return to;
            },
            writable: true,
            configurable: true
        });
    }

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function value(predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, 'length')).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, � kValue, k, O �)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            }
        });
    }

    if (!Array.prototype.findIndex) {
        Object.defineProperty(Array.prototype, 'findIndex', {
            value: function value(predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, � kValue, k, O �)).
                    // d. If testResult is true, return k.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return k;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return -1.
                return -1;
            }
        });
    }

    Math.log10 = Math.log10 =
        Math.log10 ||
        function(x) {
            return Math.log(x) * Math.LOG10E;
        };

    // https://github.com/wbkd/d3-extended
    d3$1.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };

    d3$1.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    function layout() {
        var chart = this;
        chart.wrap = d3.select(chart.element).attr('class', 'forestplot');
        chart.controls = d3
            .select(chart.element)
            .append('div')
            .attr('class', 'controls');
        chart.table = chart.wrap.append('table');
    }

    // data prep
    function dataPrep() {
        var chart = this;
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
                var pair_id = pair[0] + '_' + pair[1];
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

    function makeScales() {
        //define scales
        var chart = this;
        chart.colorScale = d3.scale
            .ordinal()
            .range([
                '#999',
                '#e41a1c',
                '#377eb8',
                '#4daf4a',
                '#984ea3',
                '#ff7f00',
                '#ffff33',
                '#a65628',
                '#f781bf'
            ])
            .domain(chart.config.groups);

        var all_percents = d3.merge(
            chart.raw.map(function(m) {
                return m.groups.map(function(n) {
                    return n.percent;
                });
            })
        );
        var percent_extent = d3.extent(all_percents);
        chart.groupScale = d3.scale
            .linear()
            .range([10, 110])
            .domain(percent_extent);

        var all_ors = d3.merge(
            chart.raw.map(function(m) {
                return m.pairs.map(function(n) {
                    return n.or;
                });
            })
        );
        var or_extent = d3.extent(all_ors);
        chart.orScale = d3.scale
            .linear()
            .range([10, 290])
            .domain([0, or_extent[1]]);
    }

    function makeBody() {
        var chart = this;
        chart.body = chart.table.append('tbody');
        chart.rows = chart.body
            .selectAll('tr')
            .data(chart.raw)
            .enter()
            .append('tr');
        chart.rows
            .append('td')
            .attr('class', 'soc')
            .text(function(d) {
                return d.soc.length > 25 ? d.soc.substring(0, 25) + '...' : d.soc;
            })
            .attr('title', function(d) {
                return d.soc;
            });
        chart.rows
            .append('td')
            .attr('class', 'term')
            .text(function(d) {
                return d.term.length > 25 ? d.term.substring(0, 25) + '...' : d.term;
            })
            .attr('title', function(d) {
                return d.term;
            });

        //Group Counts
        chart.rows
            .selectAll('td.group-count')
            .data(function(d) {
                return d.groups;
            })
            .enter()
            .append('td')
            .attr('class', 'group-count')
            .style('text-align', 'center')
            .text(function(d) {
                return d.percent;
            })
            .attr('title', function(d) {
                return d.n + '/' + d.total;
            })
            .style('cursor', 'help')
            .style('color', function(d) {
                return chart.colorScale(d.key);
            });

        //group plot
        chart.groupPlot = chart.rows
            .append('td')
            .attr('class', 'group-plot plot')
            .append('svg')
            .attr('height', 20)
            .attr('width', 120);
        chart.groupPlot
            .selectAll('circle')
            .data(function(d) {
                return d.groups;
            })
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                return chart.groupScale(d.percent);
            })
            .attr('cy', 10)
            .attr('r', 5)
            .attr('stroke', function(d) {
                return chart.colorScale(d.key);
            })
            .attr('fill', function(d) {
                return chart.colorScale(d.key);
            })
            .style('cursor', 'help')
            .append('title')
            .text(function(d) {
                return d.key + ': ' + d.percent + '% (' + d.n + '/' + d.total + ')';
            });

        //Group Comparisons
        chart.rows
            .selectAll('td.compare')
            .data(function(d) {
                return d.pairs;
            })
            .enter()
            .append('td')
            .attr('class', 'compare')
            .style('text-align', 'center')
            .text(function(d) {
                return d.or ? d.or : '-';
            })
            .attr('title', function(d) {
                return 'p=' + d.p;
            })
            .style('font-weight', function(d) {
                return d.p < 0.05 ? 'bold' : null;
            })
            .style('color', function(d) {
                return d.p < 0.05 ? 'black' : '#ccc';
            });

        var diffPlots = chart.rows
            .append('td')
            .attr('class', 'diffplot plot')
            .append('svg')
            .attr('height', 20)
            .attr('width', 300)
            .append('g');

        var diffPoints = diffPlots
            .selectAll('g')
            .data(function(d) {
                return d.pairs.filter(function(f) {
                    return f.or;
                });
            })
            .enter()
            .append('g');
        diffPoints.append('title').text(function(d) {
            return d.label + ': ' + d.or + ' (p=' + d.p + ')';
        });
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
                    {
                        x: chart.orScale(d.or),
                        y: h / 2 - r //top
                    }
                ];
                return triangle(leftpoints);
            })
            .attr('class', 'diamond')
            .attr('fill-opacity', function(d) {
                return d.p < 0.05 ? 1 : 0.1;
            })
            .attr('fill', function(d) {
                return chart.colorScale(d.group1);
            })
            .attr('stroke', function(d) {
                return chart.colorScale(d.group1);
            })
            .attr('stroke-opacity', 0.3);

        diffPoints
            .append('svg:path')
            .attr('d', function(d) {
                var h = 20;
                var r = 5;

                var rightpoints = [
                    { x: chart.orScale(d.or), y: h / 2 + r }, //bottom
                    { x: chart.orScale(d.or) + r, y: h / 2 }, //middle-right
                    {
                        x: chart.orScale(d.or),
                        y: h / 2 - r //top
                    }
                ];
                return triangle(rightpoints);
            })
            .attr('class', 'diamond')
            .attr('fill-opacity', function(d) {
                return d.p < 0.05 ? 1 : 0.1;
            })
            .attr('fill', function(d) {
                return chart.colorScale(d.group2);
            })
            .attr('stroke', function(d) {
                return chart.colorScale(d.group2);
            })
            .attr('stroke-opacity', 0.3);
    }

    function makeHeader() {
        var chart = this;
        var config = this.config;
        chart.head = chart.table.append('thead').style('text-align', 'center');
        chart.head1 = chart.head.append('tr');
        chart.head1.append('th');
        chart.head1.append('th');
        chart.head1
            .append('th')
            .text('Incidence')
            .attr('colspan', config.groups.length + 1);
        chart.head1
            .append('th')
            .text('Comparisons')
            .attr('colspan', config.pairs.length + 1);

        chart.head2 = chart.head.append('tr');
        chart.head2.append('th').text('System Organ Class');
        chart.head2.append('th').text('Preferred Term');
        chart.head2
            .selectAll('th.group')
            .data(config.groups)
            .enter()
            .append('th')
            .text(function(d) {
                return d;
            });

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
            .data(config.pairs)
            .enter()
            .append('th')
            .text(function(d) {
                return d[0] + ' vs.' + d[1];
            });
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
    }

    function makeControls() {
        var chart = this;
        var config = this.config;
        // make controls
        var indidenceControl = chart.controls.append('div').attr('class', 'slider-wrap');
        var maxPercent = Math.ceil(chart.groupScale.domain()[1]);
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
            slide: function slide(event, ui) {
                d3.select('#incidence-vals').text(ui.values[0] + ' - ' + ui.values[1]);
                chart.config.incidenceFilter = ui.values;
                table.draw();
            }
        });

        var compControl = chart.controls.append('div').attr('class', 'slider-wrap');
        var maxOR = Math.ceil(chart.orScale.domain()[1]);
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
            slide: function slide(event, ui) {
                d3.select('#comp-vals').text(ui.values[0] + ' - ' + ui.values[1]);
                chart.config.compFilter = ui.values;
                table.draw();
            }
        });

        // Search on rates
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            var incidence_vals = data.filter(function(d, i) {
                var first_col = 2;
                var last_col = first_col + config.groups.length;
                return (i >= first_col) & (i < last_col);
            });
            var incidence_max = d3.max(incidence_vals, function(d) {
                return +d;
            });
            var incidence_flag =
                (incidence_max >= chart.config.incidenceFilter[0]) &
                (incidence_max <= chart.config.incidenceFilter[1]);

            var comp_vals = data.filter(function(d, i) {
                var first_comp = 2 + config.groups.length + 1;
                var last_comp = first_comp + config.pairs.length;
                return (i >= first_comp) & (i < last_comp);
            });
            var comp_max = d3.max(comp_vals, function(d) {
                return d == '-' ? 0 : +d;
            });
            var comp_flag =
                (comp_max >= chart.config.compFilter[0]) & (comp_max <= chart.config.compFilter[1]);

            return comp_flag & incidence_flag;
        });
    }

    function draw() {
        var chart = this;

        chart.table.selectAll('*').remove();
        makeHeader.call(this);
        makeBody.call(this);
        makeControls.call(this);

        var table = $('.forestplot table')
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

    function forestPlot(data) {
        var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'body';
        var settings = arguments[2];

        console.log(settings);
        var chart = {
            raw: data,
            element: element,
            config: settings
        };

        layout.call(chart);
        dataPrep.call(chart);
        makeScales.call(chart);
        draw.call(chart);
    }

    return forestPlot;
});
