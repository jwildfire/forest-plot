function forestplot(data, element, groups, pairs){
    let chart = {}
    chart.wrap = d3.select(element)
    chart.table = chart.wrap.append("table")
    chart.raw = data;
    chart.groups = groups;
    chart.pairs = pairs;

    console.log(pairs)
    //header   
    
    chart.draw = function(data,groups,pairs){
        chart.table.selectAll("*").remove()
        chart.head = chart.table.append("thead").style("text-align", "center")
        chart.head1=chart.head.append("tr")
        chart.head1.append("td")
        chart.head1.append("td")
        chart.head1.append("td").text("Groups").attr("colspan",groups.length)
        chart.head1.append("td").text("Comparisons").attr("colspan", pairs.length)

        chart.head2 = chart.head.append("tr")
        chart.head2.append("th").text("SOC")
        chart.head2.append("th").text("Preferred Term")
        chart.head2.selectAll("th.group").data(groups).enter().append("th").text(d=>d)
        chart.head2.selectAll("th.pairs").data(pairs).enter().append("th").text(d => d[0]+" vs."+d[1])

        chart.body = chart.table.append("tbody")
        chart.rows = chart.body.selectAll("tr").data(data).enter().append("tr")
        chart.rows.append("td").attr("class","soc").text(d=>d.soc) 
        chart.rows.append("td").attr("class", "term").text(d => d.term)
        //Group Counts
        groups.forEach(function(group){
            chart.rows.append("td").attr("class", "group-count")
            .style("text-align", "center")
            .text(d=>d[group+"_percent"]+"%")
            .attr("title", d => d[group + "_n"] + "/" + d[group + "_total"])
            .style("cursor","pointer")
        })

        //Group Comparisons
        pairs.forEach(function(pair){
            let pair_or = pair[0] + "_" + pair[1] + "_or"
            let pair_p = pair[0] + "_" + pair[1] + "_pval"
            console.log(pair_or)
            chart.rows.append("td").attr("class","compare")
            .style("text-align", "center")
            .text(d=>d[pair_or] ? d[pair_or] : "-")
            .attr("title",d=>"p="+d[pair_p])
            .style("font-weight",d=>d[pair_p]<0.05 ? "bold" : null) 
            .style("color", d => d[pair_p] < 0.05 ? "black" : "#ccc") 
        })

        $('#container table').DataTable({ "paging": false, "order": [[2, "desc"]]});
    }

    chart.draw(chart.raw,groups, pairs)
}