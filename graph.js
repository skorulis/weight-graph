function makeSVG() {
	return d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function makeYAxis(scale) {
	return d3.svg.axis().scale(scale).orient("left");
}

function makeLine(scale) {
	return d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return scale(d.value); });
}

function appendXAxis(svg,axis) {
	svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(axis);
}

function appendYAxis(svg,axis) {
	svg.append("g")
			.attr("class", "y axis")
			.call(axis)
}

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
var parseDate = d3.time.format("%d-%m-%Y").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var pointY = d3.scale.linear().range([height, 0]);
var dumbellY  = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var yAxis = makeYAxis(y);
var pointYAxis = makeYAxis(pointY);
var dumbellYAxis = makeYAxis(dumbellY);

var line = makeLine(y)
var pointLine = makeLine(pointY)
var dumbellLine = makeLine(dumbellY)

var svg = makeSVG();
var pointSVG = makeSVG();
var dumbellSVG = makeSVG();

var graphByType = {points : pointSVG, dumbell : dumbellSVG, barbell : svg};
var lineByType = {points : pointLine, dumbell : dumbellLine, barbell : line};
var yByType = {points : pointY, dumbell : dumbellY, barbell : y};
    
drawMainGraph();

function drawMainGraph() {
	d3.json("results.json", function(data) {
	
		var yExtant = [20,0]
		var pointExtant = [600,0]
		var dumbellExtant = [5,0]
		var xExtant = [parseDate("25-12-2015"),0]
	
		for (var key in data) {
			var values = data[key].values
			var type = data[key].type
			values.forEach(function(d) {
				d.date = parseDate(d.date);
				if (data[key].isPounds) {
					d.value = d.value * 0.453592
				}
			});
			
			tempX = d3.extent(values, function(d) {return d.date;});
			tempY = d3.extent(values, function(d) {return d.value;});
			if (type == "points") {
				pointExtant[0] = Math.min(pointExtant[0],tempY[0])
				pointExtant[1] = Math.max(pointExtant[1],tempY[1])
			} else if(type == "barbell") {
				yExtant[0] = Math.min(yExtant[0],tempY[0])
				yExtant[1] = Math.max(yExtant[1],tempY[1])
			} else if (type == "dumbell") {
				dumbellExtant[0] = Math.min(dumbellExtant[0],tempY[0])
				dumbellExtant[1] = Math.max(dumbellExtant[1],tempY[1])
			}
			
			xExtant[0] = Math.min(xExtant[0],tempX[0])
			xExtant[1] = Math.max(xExtant[1],tempX[1])
		}
		
		y.domain(yExtant)
		pointY.domain(pointExtant)
		dumbellY.domain(dumbellExtant)
		x.domain(xExtant)
		
		appendXAxis(svg,xAxis)
		appendXAxis(pointSVG,xAxis)
		appendXAxis(dumbellSVG,xAxis)
	
		appendYAxis(svg,yAxis)	
		appendYAxis(pointSVG,pointYAxis)	
		appendYAxis(dumbellSVG,dumbellYAxis)	
		
		for (var key in data) {
			var color = data[key].color
		
			var values = data[key].values
			var type = data[key].type
			var graph = graphByType[type]
			var l = lineByType[type]
			var yValues = yByType[type]

			graph.append("path")
      .datum(values)
      .attr("class", "line")
      .attr("d", l)
      .style({
      	stroke:color,
      })
      
      graph.append("text")
			.attr("transform", "translate(" + (width-50) + "," + yValues(values[values.length-1].value) + ")")
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.style("fill", color)
			.text(key);
		}
		
		
	});
}