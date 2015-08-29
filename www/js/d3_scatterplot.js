// Global data
var dataset = []; // The data that is going to be rendered
var distance = [];

// Setup settings for graphic

var canvas_width = 1000;
var canvas_height = 500;
var padding = 30; // for chart edges

// Scale functions
var xScale, yScale;

// Axis
var xAxis, yAxis;

// SVG Object
var svg;

// HTML element to put the visualization in
var d3SP_element="d3ScatterPlot";

// Tooltip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>" + champion_index[d["champion"]]["name"] + "</strong>";
  })


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
    //console.log(this.dataset);
    this.svg.selectAll("circle")
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
    this.svg = d3.select(d3SP_element) // This is where we put our vis
        .append("svg")
        .attr("width", canvas_width)
        .attr("height", canvas_height)

    // Add to X axis
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (canvas_height - padding) + ")")
        .call(xAxis);

    // Add to Y axis
    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    this.svg.call(tip);

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
    // Get the random points
    var randomPoints = getRandomPoints(numDataPoints, maxRange);
    // Next step
    initializeScatterPlot(randomPoints);
};
 
// **************************************
// * Update functions                   *
// **************************************

//
// Plot
//

function updateDataset(newDataset){
    if (newDataset == null || newDataset == undefined){
        console.log("Attempted to set dataset to null or undefined. No changes were made.");
        return;
    }
    //console.log("Dataset:" + dataset.length + "\tNewdataset:" + newDataset.length + "\tCompare:" +( newDataset.length > dataset.length ? newDataset.length : dataset.length ))
    for (var i = 0 ; i < ( newDataset.length > this.dataset.length ? newDataset.length : this.dataset.length ) ; i++ ){
        this.distance[i] = Math.sqrt( Math.pow(getX(this.dataset[i]) - getX(newDataset[i]),2) + Math.pow(getY(this.dataset[i]) - getY(newDataset[i]),2) );
    }
    this.dataset = newDataset;
}

function updateScaleAndAxisWithValues(domain, range) {

    this.xScale.domain(range);

    this.yScale.domain(domain);

    this.svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

    this.svg.select(".y.axis")
        .transition()
        .duration(100)
        .call(yAxis);
}

function updateScaleAndAxis() {

    updateScaleAndAxisWithValues(
    [
        d3.min(dataset, getY),
        d3.max(dataset, getY)
    ],
    [
        d3.min(dataset, getX),
        d3.max(dataset, getX)
    ]

    )
    /*
    this.xScale.domain([
        d3.min(dataset, getX),
        d3.max(dataset, getX)
    ]);

    this.yScale.domain([
        d3.min(dataset, getY),
        d3.max(dataset, getY)
    ]);

    this.svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

    this.svg.select(".y.axis")
        .transition()
        .duration(100)
        .call(yAxis);
    */
}

function updateCircles() {

    this.svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(getX(d));
        })
        .attr("cy", function(d) {
            return yScale(getY(d));
        })
        .attr("r", function(d){
            return 2;
        })
        .style("visibility", function(d) {
            //console.log(d);
            return d == undefined ? "hidden" : "visible";
        });

    this.svg.selectAll("circle")
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
        .each(function(){
            // Fill with image
            d3  .select(this)
                .style("fill", function(d){
                    if (d == null) return null;
                    return "url(#" + d["champion"] + ")";
                });
        })
        .each(function(){
            d3  .select(this)
            .on('mouseover',tip.show)
            .on('mouseout', tip.hide);
        })
        /* // Mouseover image enlargement not functional
        .each(function(){
            d3  .select(this)
            .on('mouseover',function() {
                d3  .select(this)
                    .transition()
                    .duration(200)
                    .attr("r", function(d){ 
                                if (d == null)
                                    return 2;
                                return (Math.log(d.games) + 5) * 2;
                    }); // Change radius 
            })
            .on('mouseout',function () {
                d3  .select(this)
                    .transition()
                    .duration(200)
                    .attr("r", function(d){ 
                                if (d == null)
                                    return 2;
                                return Math.log(d.games) + 5;
                    }); // Change radius 
            })
        })
        // */
        .each("end", function() { // End animation
            d3.select(this) // 'this' means the current element
                .transition()
                .duration(500)
                .attr("fill", "black") // Change color
                .attr("r", function(d){ 
                                if (d == null)
                                    return 2;
                                return Math.log(d.games) + 5;
                            } ); // Change radius   
        })
        .style("visibility", function(d) {
            return d == undefined ? "hidden" : "visible";
        });
}

function updateScatterPlot(){
    updateScaleAndAxis();
    updateCircles();
}

//
// GUI elements
//

function updateDeltaTable() {
    var table = document.getElementById("delta-table")
    table.innerHTML = '';

    newEntries = [];
    for(i in distance) {
        if(distance[i] > 0) {
            if (champion_index[i] == null || champion_index[i] == undefined )
                continue;
            d = distance[i];
            //console.log(i);
            c = champion_index[i].name;
            i = champion_index[i].image;
            table.innerHTML += "<div class='panel panel-default delta-panel'><div class='panel-body'><img src='" + i +"'></img>" + c + "</div></div>";
        }
    }
}

//
// Data elements
//

function setGameData(patch, region, tier){
    var file = ""
    if( region == "ALL_REGIONS" && tier == "ALL_TIERS") {
        file = "data/by_patch/grp_" + patch + ".json";
    } else if ( region == "ALL_REGIONS") {
        file = "data/by_patch_tier/grp_" + patch + "_" + tier + ".json"; 
    } else if ( tier == "ALL_TIERS" ) {
        file = "data/by_patch_region/grp_" + patch + "_" + region + ".json";
    } else {
        file = "data/by_patch_region_tier/grp_" + patch + "_" + region + "_" + tier + ".json";
    }
    loadDataFromFile(
        file,
        function(json){
            updateDataset(json);
            updateScatterPlot();
            updateDeltaTable();
        }
    );
}


// **************************************
// * Misc functions                     *
// **************************************

function getRandomPoints(volume, maxValue){
    var data = [];
    for (var i = 0; i < volume; i++) {
        var newObject = {};
        newObject.coordinate = {};
        newObject.coordinate.x = Math.floor(Math.random() * maxValue);
        newObject.coordinate.y = Math.floor(Math.random() * maxValue);
        data.push(newObject); // Add new number to array
    }
    return data;
}

function loadDataFromFile(filename, cb){
    //TODO: Add some safety
    $.getJSON(filename, 
        function(json){
            var data = [];
            for (var i in json){
                data[json[i].champion] = json[i];
            }
            cb(data);
        }
        );
}

function getX(data) {
    if (!data) return 0;
    return data.coordinate.x;
}
function getY(data) {
    if (!data) return 0;
    return data.coordinate.y;
}
function getValue(data){
    if (!data) return 0;
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


