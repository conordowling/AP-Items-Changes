// **************************************
// * Variable initializations           *
// **************************************

// The data that is going to be rendered
// Format:
// { "champion": championID, "coordinate": {"x": xCoordinate, "y": yCoordinate}, "games": numberOfGames, "patch": patch, "region": region, "tier": tier }
var dataset = [];

// The old dataset. Used for comparisons
var oldDataSet = [];

// Euclidean distance between the current dataset and the old dataset
var distance = [];

// Setup settings for graphic
var canvas_width = 800;
var canvas_height = 500;
var padding = 30; // for chart edges

// Scale functions
var xScale, yScale;

// Axis
var xAxis, yAxis;

// SVG Object
var svg;

// Name of HTML element to put the visualization in
var d3SP_element="d3ScatterPlot";

// Tooltip function
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>" + champion_index[d["champion"]]["name"] + "</strong>";
  })



// **************************************
// * Plot creation                      *
// **************************************

// Create a scatter plot
initializeRandomScatterPlot(10, 100);



// **************************************
// * Initialization functions           *
// **************************************

// Loads all the circles from the local dataset variable. 
// This follows the initializeD3Visualization
// Arguments:
//  None
// Returns:
//  Nothing
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
// Returns:
//  Nothing
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
// Returns:
//  Nothing
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


// Function to build the scatterplot based on data
// Arguments:
//  data: See dataset for format of data
// Returns:
//  Nothing
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

// Function to build the scatterplot based on randomly generated data
// Arguments:
//  numDataPoints:  Number of points to be plotted
//  maxRange:       Maximum X,Y value of a given point (int)
// Returns:
//  Nothing
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

// Update the data that plot uses to create the circles
// Arguments:
//  newDataset: See dataset variable for appropriate format
// Returns:
//  Nothing
function updateDataset(newDataset){

    // Input validation
    if (newDataset == null || newDataset == undefined){
        console.log("Attempted to set dataset to null or undefined. No changes were made.");
        return;
    }
    // Store the old dataset to do comparisons to the new one
    this.oldDataSet = dataset;

    // Calculate the distance between the old points and the new ones
    for (var i = 0 ; i < ( newDataset.length > this.dataset.length ? newDataset.length : this.dataset.length ) ; i++ ){
        this.distance[i] = Math.sqrt( Math.pow(getX(this.dataset[i]) - getX(newDataset[i]),2) + Math.pow(getY(this.dataset[i]) - getY(newDataset[i]),2) );
    }
    this.dataset = newDataset;
}

// Update the bounds and size of the chart
// Arguments:
//  domain: [minY, maxY]
//  range : [minX, maxX]
// Returns:
//  Nothing
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

// Update the bounds and size of the chart based on the values in the dataset
// Returns:
//  Nothing
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
}

// Update the location of the circles based on the values in the dataset
// Returns:
//  Nothing
function updateCircles() {

    // The radius of the circles while at rest
    var finalRadius = function(elem){
        return 10;
    }
    // The radius of the circles while in motion
    var transformingRadius = function(elem){
        return 5;
    }
    // The radius of the circles while being hovered over
    var mouseOverRadius = function(elem){
        return 17;
    }

    // Generate new circles if any are missing
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
        .attr("r", transformingRadius);

    // Set visibility on circles
    this.svg.selectAll("circle")
        .style("visibility", function(d) {
            return d == undefined ? "hidden" : "visible";
        });

    // Move old circles to a new location
    this.svg.selectAll("circle")
        // This may cause inconsistancies, but improves performance
        //.filter(function(d) { if (d != null || d != undefined) return true;}) // Only work on elements that exist
        // Duplicate command: Probably unnecessary
        //.data(dataset)
        .transition()
        .duration(1000)
        // At the start of the move, perform these operations
        .each("start", function() {
            d3.select(this)
                //.attr("fill", "red") // Legacy: circles now have a image fill, this does not apply correctly
                .attr("r", transformingRadius);
        })
        .delay(function(d, i) {
            return i / dataset.length * 500; // Dynamic delay (i.e. each item delays a little longer)
        })
        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
        .attr("cx", function(d) {
            return xScale(getX(d));
        })
        .attr("cy", function(d) {
            return yScale(getY(d));
        })
        // Fill the circle with an image
        .each(function(){
            d3  .select(this)
                .style("fill", function(d){
                    if (d == null) return null;
                    return "url(#" + d["champion"] + ")";
                });
        })
        // Add the mouseover and mouseout functions
        //  - This includes the zoom and the tooltip
        .each(function(){
            d3  .select(this)
                .on('mouseover',function(selected) {

                    // Add the tooltip
                    tip.show(selected);
                    
                    // Bring the active circle to the foreground
                    // Problems:    - High performance cost
                    //              - Causes some reodering elsewhere which is a little distracting and looks unprofessional
                    // Update:      Problems reduced with filter. TODO: Test before release
                    svg.selectAll('circle')
                        .filter(function(d) { if (d != null || d != undefined) return true;})
                        .sort(function(a, b) {
                            if (a.champion === selected.champion) {
                                return 1;
                            } else {
                                if (b.champion === selected.champion) {
                                    return -1;
                                } else {
                                    return 0;
                                }
                            }
                        });

                    // Set the radius
                    d3  .select(this)
                        .transition()
                        .duration(200)
                        .attr("r", mouseOverRadius);
                })
                .on('mouseout',function (selected) {
                    tip.hide(selected);
                    d3  .select(this)
                        .transition()
                        .duration(200)
                        .attr("r", finalRadius);
                })
        })
        // Once the move is complete, perform these operations
        .each("end", function() { // End animation
            d3.select(this) // 'this' means the current element
                .transition()
                .duration(500)
                //.attr("fill", "black") // Legacy: circles now have a image fill, this does not apply correctly
                .attr("r", finalRadius);  
        })
}

// Update the axis and the circles based on the dataset
// Returns:
//  Nothing
function updateScatterPlot(){
    updateScaleAndAxis();
    updateCircles();
}

//
// GUI elements
//

function updateDeltaTable() {
    var table = document.getElementById("delta-table")
    var newTable = "";

    for(var i = 0; i < this.distance.length; i++) {
        if(this.distance[i] > 0) {
            if (champion_index[i] == null || champion_index[i] == undefined )
                continue;
            var distance = this.distance[i];
            var champion_name = champion_index[i].name;
            var champion_image = "http://ddragon.leagueoflegends.com/cdn/5.16.1/img/champion/" + champion_index[i]["image"]["full"] + "";

            var newRow = "<div class='panel panel-default delta-panel'><div class='panel-body'><img src='" + champion_image +"' height='30'>" + champion_name + "\tDistance: " + Math.round(this.distance[i]) + "</div></div>";

            newTable = newTable.concat(newRow);
        }
    }

    table.innerHTML = newTable;
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

// Create random data points
// Returns:
//  Array of: { "coordinate": {"x": x, "y": y}}
// Arguments:
//  volume: number of points
//  maxValue: Upper bound on the random point
// Returns:
//  The array
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

// Load JSON from a web file
// Note: Not tested cross-server
// Arguments:
//  filename: The name and path of the JSON file
//  cb: Function with the payload as it's argument
// Returns:
//  Nothing
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

// Get the X-coordinate from the given data point
// Argument:
//  element: Object to obtain the x-value of
// Returns:
//  The x-value, or 0 if element is null
function getX(element) {
    if (!element) return 0;
    return element.coordinate.x;
}

// Get the Y-coordinate from the given data point
// Argument:
//  element: Object to obtain the y-value of
// Returns:
//  The y-value, or 0 if element is null
function getY(element) {
    if (!element) return 0;
    return element.coordinate.y;
}

// Get the value/ID from the given data point
// Argument:
//  element: Object to obtain the value of
// Returns:
//  The value, or 0 if element is null
function getValue(element){
    if (!element) return 0;
    return element.champion;
}

// A compare function based on getValue
// See Javascript compare functions for I/O
function compare(a, b){
    if (getValue(a) > getValue(b)){
        return 1;
    } else if (getValue(a) < getValue(b)){
        return -1;
    } else {
        return 0;
    }
}