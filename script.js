var req = new XMLHttpRequest();
req.open('GET', 'GDP-data.json', true);
req.send();
req.onload = function() {
    const dataset = JSON.parse(req.responseText);
    const data = dataset.data;

    // console.log(data);

    const xdata = data.map(function(d) {
        return Number(d[0].slice(0,4));
    });
    // console.log();


    const w = 800;
    const h = 600;
    const padding = 50;

    const svg = d3.select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h);

    // x axis
    const xScale = d3.scaleLinear()
        .domain([d3.min(xdata, d => d), d3.max(xdata, d => d)])
        .range([padding, w - padding]);
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append('g')
        .attr('transform', `translate(0, ${h - padding})`)
        .attr('id', 'x-axis')
        .call(xAxis);

    // y axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .range([h - padding, padding]);
    const yAxis = d3.axisRight(yScale);
    svg.append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);




    // The bars

    // const ydata = data.map(e => e[1]);
    // console.log(ydata.length);

    // console.log(data);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', (d,i) => ((w-(padding*2)) / data.length) * i + padding)
            .attr('y', d => yScale(d[1]))
            .attr('width', ((w - (padding * 2)) / data.length))
            .attr('height', d => (h - padding) - yScale(d[1]))
            .attr('class', 'bar')
            .attr('data-date', d => d[0])
            .attr('data-gdp', d => d[1])
            .attr('title', d => `Date: ${d[0]}, GDP: ${d[1]}`)


    // svg.selectAll('rect')
    //     .data(d)

}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('body').addEventListener('mouseover', event => {
        // console.log('event');
        if(event.target.classList.contains('bar')) {
            // console.log('mouseover .bar');

            const data = event.target.dataset;

            // console.log(event.target.dataset);


            const tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'inherit';
            tooltip.dataset.date = data.date;
            tooltip.innerHTML = `${data.date}<br>GDP: ${data.gdp}`;

        }
    });

    document.querySelector('body').addEventListener('mouseout', event => {
        // console.log('event');
        if(event.target.classList.contains('bar')) {
            console.log('mouseout .bar');

            document.getElementById('tooltip').style.display = 'none';
        }
    });

});