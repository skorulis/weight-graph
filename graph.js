var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    
var parseDate = d3.time.format("%d-%m-%Y").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var pointY = d3.scale.linear().range([height, 0]);

var pointLine = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return pointY(d.value); });

var pointYAxis = d3.svg.axis()
	.scale(pointY)
	.orient("left");

var pointSVG = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
drawMainGraph();

function drawMainGraph() {
	d3.json("results.json", function(data) {
	
		var yExtant = [20,0]
		var pointExtant = [600,0]
		var xExtant = [parseDate("25-12-2015"),0]
	
		for (var key in data) {
			var values = data[key].values
			values.forEach(function(d) {
				d.date = parseDate(d.date);
				if (data[key].isPounds) {
					d.value = d.value * 0.453592
				}
			});
			
			tempX = d3.extent(values, function(d) {return d.date;});
			tempY = d3.extent(values, function(d) {return d.value;});
			if (key == "points") {
				pointExtant[0] = Math.min(pointExtant[0],tempY[0])
				pointExtant[1] = Math.max(pointExtant[1],tempY[1])
			} else {
				yExtant[0] = Math.min(yExtant[0],tempY[0])
				yExtant[1] = Math.max(yExtant[1],tempY[1])
			}
			
			xExtant[0] = Math.min(xExtant[0],tempX[0])
			xExtant[1] = Math.max(xExtant[1],tempX[1])
		}
		
		y.domain(yExtant)
		pointY.domain(pointExtant)
		x.domain(xExtant)
		console.log(pointExtant)
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
	
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			
		pointSVG.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
	
		pointSVG.append("g")
			.attr("class", "y axis")
			.call(pointYAxis)
		
		for (var key in data) {
			var color = data[key].color
		
			var values = data[key].values
			var graph = key == "points" ? pointSVG : svg;
			var l = key == "points" ? pointLine : line;

			graph.append("path")
      .datum(values)
      .attr("class", "line")
      .attr("d", l)
      .style({
      	stroke:color,
      })
      
      graph.append("text")
			.attr("transform", "translate(" + (width-50) + "," + y(values[values.length-1].value) + ")")
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.style("fill", color)
			.text(key);
		}
		
		
	});
}