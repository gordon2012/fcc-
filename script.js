const w = 800;
const h = 600;
const padding = 50;

var req = new XMLHttpRequest();
req.open('GET', 'GDP-data.json', true);
req.send();
req.onload = function() {
    const dataset = JSON.parse(req.responseText);

    const data = dataset.data.map((d,i,a) => {
        if(i > 0) {
            d.push(Number(d[1]) - Number(a[i-1][1]));
            d.push((Number(d[1]) < Number(a[i-1][1]) ? -1 : 1) * Number(d[1]) / Number(a[i-1][1]));
        } else {
            d.push(0);
            d.push(0);
        }

        // d.push(
        //     i > 0 ? Number(d[1]) - Number(a[i-1][1]) : 0
        // );

        // d.push(i > 0 ? Number(d[1]) - Number(a[i-1][1]) : 0);

        return d;
    });

    console.log(data);

    // console.log(data.map((d,i,a) => i > 0 ? Number(d[1]) - Number(a[i-1][1]) : 0));





    data.forEach((d,i,a) => {
        // console.log(`${i} | ${a[i][1]}   ${a[i-1]} - ${Number(d[1])}`);
        // console.log(` ${i} | ${a[i-1]} | ${d}`);
    });




    const svg = d3.select('.svg-wrap')
        .append('svg')
        .attr('class', 'card')
        .attr('width', w)
        .attr('height', h);

    // x axis
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[0].slice(0,4)), d3.max(data, d => d[0].slice(0,4))])
        .range([padding, w - padding]);
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));
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


    // color
    const cScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[2]), d3.max(data, d => d[2])])
        .range([0, 255]);
    console.log(cScale(-1));



    // The bars
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', (d,i) => ((w-(padding*2)) / data.length) * i + padding)
            .attr('y', d => yScale(d[1]))
            .attr('width', ((w - (padding * 2)) / data.length))
            .attr('height', d => (h - padding) - yScale(d[1]))
            .attr('class', 'bar')
            .attr('fill', d => d[2] < 0 ? `rgb(${cScale(-d[2])},0,0)` : d[2] > 0 ? `rgb(0,${cScale(d[2])},0)` : 'black')
            .attr('data-date', d => d[0])
            .attr('data-gdp', d => d[1])
            // .attr('data-growth', (d,i,a) => i > 0 ? d[1][1] > a[i-1][1] ? d[1] / a[i-1][1] : -(1 - (d[1] / a[i-1][1]) ) : 0 )
            // .attr('data-growth', (d,i,a) => i > 0 ? `${d[1]} | ${a[i-1]}` : 0)
            // .attr('data-gdpPrev', (d,i,a) => i > 0 ? )
            .attr('data-growth', d => d[3])
            .attr('title', d => `Date: ${d[0]}, GDP: ${d[1]}`)
}

// Tooltip
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('body').addEventListener('mouseover', event => {
        if(event.target.classList.contains('bar')) {
            const data = event.target.dataset;

            const tooltip = document.getElementById('tooltip');
            tooltip.dataset.date = data.date;

            tooltip.style.opacity = 1;
            tooltip.style.left = `${event.x + ((w - 160 - 20 - event.x) > 0 ? 20 : -180)}px`;

            tooltip.querySelector('.tooltip-date').innerHTML = `${data.date.slice(0,4)} Q${Math.floor((Number(data.date.slice(5,7))-1)/3)+1}`;
            tooltip.querySelector('.tooltip-gdp').innerHTML = `$${Number(data.gdp).toLocaleString('en')}B`;

            tooltip.querySelector('.tooltip-growth').innerHTML = `${data.growth}`;
            tooltip.querySelector('.tooltip-growth').style('color', 'red');
        }
    });

    document.querySelector('body').addEventListener('mouseout', event => {
        if(event.target.classList.contains('bar')) {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.opacity = 0;
        }
    });
});
