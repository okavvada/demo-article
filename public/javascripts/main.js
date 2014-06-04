/* Console
 ********************/
//Write a new message in the console
function consoleMessage(message) {
    $("#sim_console ul").prepend($("<li>").text(message));
}

function clearConsole() {
    $("#sim_console ul").clear();
}

/*Graph Bar
***************************/

//Global Parameters
var params = {
//to be modified by hand
    height: 60,
    play_time: 12,
    simul_name : "morse",
    demo12_scenario : "smallerfc",
    paint_simul_name : "test2",
    morse_delay : 3000,
    morse_height_ratio : .3,
    paint_ratio : 1.,

//Automatically set up
    width: getSimulWidth(),
    play : false,
    morse_pause : false,
    playSim : void 0,
    simul_data : void 0,
    position_scale : void 0,
    vertical_scale : void 0,
    space_length : void 0,
    time_length : void 0,
    morse_time : void 0,
    morse : void 0,
    morse_info : false,
    update_function : playUpdate,
    update_simul : updateSimul,
    resize_simul : resizeSimul,
    width_function : getSimulWidth

}

//fetch and draw the data
function initSimul(simulName){
    d3.json("simulation/" + params.simul_name + ".json", function(error, json) {
      if (error) return console.warn(error);
      params.simul_data = json;
      drawSimul();
    });
}


//return the width of the simulation (depend on the window size)
function getSimulWidth(){ return $("#simul_container").width()}

//Return the color given the density (Don't accept negative densities !)
function densityColors(dens,i){
    critical_density = params.simul_data.criticalDensity[i];
    max_density = params.simul_data.maxDensity[i];
    if(dens < critical_density)
        return "hsl(90,69%," +  40 *( 2 - dens/critical_density)+"%)";
    else
        return "hsl(" + 90 * (max_density - dens)/(max_density - critical_density) + ",69%," + (50  - 10 * (dens - critical_density)/(max_density - critical_density)) + "%)"
}

//Draw a simulation
function drawSimul(){

    params.space_length = params.simul_data.density[0].length;
    params.time_length = params.simul_data.density.length;
    params.width = params.width_function();

    //Init the slider
    $( "#time_slider" ).slider({ animate: "fast",
                                 max: (params.time_length - 1),
                                 min: 0,
                                 slide: function( event, ui ) {updateSimul()}});
    //Init the play button
    $("#play_button").click(playSimul);
    //Drawing the svg
    var svg = d3.select("#simul").append("svg");
    svg.attr("width", params.width)
       .attr("height", params.height);

    params.position_scale = d3.scale.linear()
                        .domain([0, params.space_length])
                        .range([0, params.width]);

    svg.selectAll("rect")
       .data(params.simul_data.density[0])
       .enter()
       .append("rect")
       .attr("x", function(d,i){;
            return Math.floor(params.position_scale(i));
       })
       .attr("y", 0)
       .attr("width", params.width/params.space_length +1)
       .attr("height", params.height)
       .attr("fill", function(d,i) {
           return densityColors(d,i);
       });
    $( window ).resize(params.resize_simul);
    consoleMessage("Simulation loaded");
    $.event.trigger({
    	type: "simulation_loaded"
    });
}


//Called when the slider is moving
function updateSimul(){
    var time = $( "#time_slider" ).slider( "value" );

    d3.select("#simul svg")
      .selectAll("rect")
       .data(params.simul_data.density[time])
       .transition()
       .attr("fill", function(d,i) {
           return densityColors(d,i);
       });

}

//Called when the size of the window is changing
function resizeSimul(){
    params.width = params.width_function();

    params.position_scale = d3.scale.linear()
                            .domain([0, params.space_length])
                            .range([0, params.width]);

    var svg = d3.select("#simul svg");
    svg.attr("width", params.width);

    svg.selectAll("rect")
       .data(params.simul_data.density[$( "#time_slider" ).slider( "value" )])
       .attr("x", function(d,i){;
            return Math.floor(params.position_scale(i));
       })
       .attr("width", params.width/params.space_length+1);
}

//Handle the Simulation play

function stopSim() {
    clearInterval(params.playSim);
    params.play = false;
    params.morse_pause = false;
}

function playUpdate(){
    if($( "#time_slider" ).slider( "value" ) == (params.time_length - 1))
        stopSim();
    else{
        $( "#time_slider" ).slider( "value", ($( "#time_slider" ).slider( "value") + 1) );
        params.update_simul();
    }
}
//called when play button is clicked
function playSimul(){
    if(params.play)
        stopSim();
    else {
        var time_interval = params.play_time * 1000 / params.time_length;
        params.playSim = setInterval(params.update_function, time_interval);
        params.play = true;
    }
}

