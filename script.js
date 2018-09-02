var req = new XMLHttpRequest();
req.open('GET', 'GDP-data.json', true);
req.send();
req.onload = function() {
    const dataset = JSON.parse(req.responseText);
    const data = dataset.data;


    console.log(data);

    const w = 800;
    const h = 600;

    const padding = 50;

    // x axis
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([padding, w - padding]);
    const xAxis = d3.axisBottom(xScale);

    const svg = d3.select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h);


    svg.append('g')
        .attr('transform', `translate(0, ${h - padding})`)
        .call(xAxis);



    // svg.selectAll('rect')
    //     .data(d)

}