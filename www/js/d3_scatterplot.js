// Global data
var dataset = []; // The data that is going to be rendered

// Setup settings for graphic
var canvas_width = 500;
var canvas_height = 300;
var padding = 30; // for chart edges

// Scale functions
var xScale, yScale;

// Axis
var xAxis, yAxis;

// SVG Object
var svg;


// Create a scatter plot
initializeRandomScatterPlot(10, 100);


// **************************************
// * Initialization functions           *
// **************************************

// Loads all the circles from the local dataset variable. 
// This follows the initializeD3Visualization
// Arguments:
//  None
function initializeDataPointsFromDataset() {
    // Create Circles
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(getX(d));
        })
        .attr("cy", function(d) {
            return yScale(getY(d));
        })
        .attr("r", 2);
}

// Function to initialize D3 visualization. It uses the d3ScatterPlot element found in the HTML page to host the visualization.
// This follows initializeScale
// Arguments:
//  None
function initializeD3Visualization() {
    // Define X axis
    this.xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    // Define Y axis
    this.yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

    // Create SVG element
    this.svg = d3.select("d3ScatterPlot") // This is where we put our vis
        .append("svg")
        .attr("width", canvas_width)
        .attr("height", canvas_height)

    // Add to X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (canvas_height - padding) + ")")
        .call(xAxis);

    // Add to Y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    // Next step
    initializeDataPointsFromDataset();
};

// Function to initialize the scale functions
// Arguments:
//  newxScale: The bounds of the X-axis. In the form of [xmin, xmax]
//  newyScale: The bounds of the Y-axis. In the form of [ymin, ymax]
function initializeScale(newxScale, newyScale) {
    // xScale is width of graphic
    this.xScale = d3.scale.linear()
        .domain([newxScale[0], newxScale[1]])
        .range([padding, canvas_width - padding * 2]);
    // yScale is height of graphic
    // Remember y starts on top going down so we flip
    this.yScale = d3.scale.linear()
        .domain([newyScale[0], newyScale[1]])
        .range([canvas_height - padding, padding]);
    // Next step
    initializeD3Visualization();
};

function initializeScatterPlot(data) {
    this.dataset = data;
    // Next step
    initializeScale(
        [
            d3.min(dataset, getX),
            d3.max(dataset, getX)
        ], [d3.min(dataset, getY),
            d3.max(dataset, getY)
        ]
    );
};

function initializeRandomScatterPlot(numDataPoints, maxRange) {
    var data = [];
    for (var i = 0; i < numDataPoints; i++) {
        var newNumber1 = Math.floor(Math.random() * maxRange); // New random integer
        var newNumber2 = Math.floor(Math.random() * maxRange); // New random integer
        data.push([newNumber1, newNumber2]); // Add new number to array
    }
    // Next step
    initializeScatterPlot(data);
};
 
// **************************************
// * Update functions                   *
// **************************************

function updateDataset(newDataset){
    this.dataset = newDataset;
}

function updateScaleAndAxis() {

    xScale.domain([
        d3.min(dataset, getX),
        d3.max(dataset, getX)
    ]);

    yScale.domain([
        d3.min(dataset, getY),
        d3.max(dataset, getY)
    ]);

    svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

    svg.select(".y.axis")
        .transition()
        .duration(100)
        .call(yAxis);
}

function updateCircles() {

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(getX(d));
        })
        .attr("cy", function(d) {
            return yScale(getY(d));
        })
        .attr("r", 2);

    svg.selectAll("circle")
        .data(dataset) // Update with new data
        .transition() // Transition from old to new
        .duration(1000) // Length of animation
        .each("start", function() { // Start animation
            d3.select(this) // 'this' means the current element
                .attr("fill", "red") // Change color
                .attr("r", 5); // Change size
        })
        .delay(function(d, i) {
            return i / dataset.length * 500; // Dynamic delay (i.e. each item delays a little longer)
        })
        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
        .attr("cx", function(d) {
            return xScale(getX(d));
        })
        .attr("cy", function(d) {
            return yScale(getY(d)); // Circle's Y
        })
        .each("end", function() { // End animation
            d3.select(this) // 'this' means the current element
            .transition()
                .duration(500)
                .attr("fill", "black") // Change color
            .attr("r", "2"); // Change radius   
        });
}

function updateScatterPlot(){
    updateScaleAndAxis();
    updateCircles();
}

// **************************************
// * Misc functions                     *
// **************************************

function loadDataFromFile(filename, cb){
    //TODO: Add some safety
    $.getJSON(filename, cb);
}

function getX(data) {
    return data[0];
}

function getY(data) {
    return data[1];
}
function getValue(data){
    return data.champion;
}
function compare(a, b){
    if (getValue(a) > getValue(b)){
        return 1;
    } else if (getValue(a) < getValue(b)){
        return -1;
    } else {
        return 0;
    }
}


