const maxW = 800;
const maxH = 600;

const maxPadding = 50;
const minPadding = 25;
const wrapPadding = 15;

let w = maxW;
let h = maxH;
let padding = maxPadding;

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if(!immediate) {
                func.apply(context, args);
            }
        }
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if(callNow) {
            func.apply(context, args);
        }
    };
};

var resize = debounce(function () {
    const title = document.getElementById('title');
    const titleStyle = getComputedStyle(title);
    const titleHeight = title.offsetHeight + parseInt(titleStyle.marginTop) + parseInt(titleStyle.marginBottom);

    if(window.innerWidth < 900) {
        w = window.innerWidth - (wrapPadding * 2);
        h = window.innerHeight - titleHeight - (wrapPadding * 2) - 5;
        padding = minPadding;
    } else {
        w = maxW;
        h = maxH;
        padding = maxPadding;
    }

    drawChart();
}, 100);

const drawChart = () => {
    const svg = d3.select('.svg-target')
        .html('')
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

    // Bar colors
    const cScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[2]), d3.max(data, d => d[2])])
        .range([0, 255]);

    // Bar shapes
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
            .attr('data-growth', d => d[3])
            .attr('title', d => `Date: ${d[0]}, GDP: ${d[1]}`);
};

let data;
const req = new XMLHttpRequest();
req.open('GET', 'GDP-data.json', true);
req.send();
req.onload = function() {
    const dataset = JSON.parse(req.responseText);

    data = dataset.data.map((d,i,a) => {
        if(i > 0) {
            const curr = Number(d[1]);
            const prev = Number(a[i-1][1]);
            const delta = curr - prev;

            d.push(delta);
            d.push((delta / prev) * 100);
        } else {
            d.push(0);
            d.push(0);
        }
        return d;
    });

    resize();
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', resize);

    // Tooltip
    document.querySelector('body').addEventListener('mouseover', event => {
        if(event.target.classList.contains('bar')) {
            const data = event.target.dataset;

            const tooltip = document.getElementById('tooltip');
            tooltip.dataset.date = data.date;

            tooltip.style.opacity = 1;
            tooltip.style.left = `${event.x + ((w - 160 - 20 - event.x) > 0 ? 20 : -180)}px`;

            tooltip.querySelector('.tooltip-date').innerHTML = `${data.date.slice(0,4)} Q${Math.floor((Number(data.date.slice(5,7))-1)/3)+1}`;

            tooltip.querySelector('.tooltip-gdp').innerHTML = `$${Number(data.gdp).toLocaleString('en')}B`;

            let growth = data.growth < 0 ? (Math.abs(Number(data.growth))) : data.growth > 0 ? Number(data.growth) : '';
            tooltip.querySelector('.tooltip-growth').innerHTML = `${growth.toLocaleString('en', {maximumFractionDigits: 3})}${data.growth < 0 ? '% decrease' : data.growth > 0 ? '% increase' : ''}`;
            tooltip.querySelector('.tooltip-growth').setAttribute('style', `color: ${data.growth < 0 ? 'red' : 'green'};`);
        }
    });

    document.querySelector('body').addEventListener('mouseout', event => {
        if(event.target.classList.contains('bar')) {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.opacity = 0;
        }
    });
});
