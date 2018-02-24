queue()
    .defer(d3.json, "/app1/data")
    .defer(d3.json, "../static/static/shapefile4.geojson")
    .await(makeGraphs);


function makeGraphs(error,recordsJson,statesJson) {
	
	//Clean data
	var records = recordsJson;

	//var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	// var dateFormat = d3.time.format("%Y/%m/%d");
	var dateFormat = d3.time.format("%d/%m/%Y");
	
	records.forEach(function(d) {
		d["timestamp"] = dateFormat.parse(d["timestamp"]);
		// d["timestamp"].setMinutes(0);
		// d["timestamp"].setSeconds(0);
		// d["longitude"] = +d["longitude"];
		// d["latitude"] = +d["latitude"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["timestamp"]; });
	var genderDim = ndx.dimension(function(d) { return d["gender"]; });
	var ageSegmentDim = ndx.dimension(function(d) { return d["age_segment"]; });
	var phoneBrandDim = ndx.dimension(function(d) { return d["phone_brand_en"]; });
	var locationDim = ndx.dimension(function(d) { return d["location"]; });
	var allDim = ndx.dimension(function(d) {return d;});




	//Group Data
	var numRecordsByDate = dateDim.group();
	var genderGroup = genderDim.group();
	var ageSegmentGroup = ageSegmentDim.group();
	var phoneBrandGroup = phoneBrandDim.group();
	var locationGroup = locationDim.group();
	var all = ndx.groupAll();
	var totalDonationsByState = locationDim.group().reduceSum(function(d) {
	    return d["latitude"];
	});


	//Define values (to be used in charts)
	var max_state = totalDonationsByState.top(1)[0].value;
	console.log(max_state);
	var minDate = dateDim.bottom(1)[0]["timestamp"];
	var maxDate = dateDim.top(1)[0]["timestamp"];


    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records-nd");
	var timeChart = dc.barChart("#time-chart");
	var genderChart = dc.rowChart("#gender-row-chart");
	var ageSegmentChart = dc.rowChart("#age-segment-row-chart");
	var phoneBrandChart = dc.rowChart("#phone-brand-row-chart");
	var locationChart = dc.rowChart("#location-row-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");



	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);


	timeChart
		.width(550)
		.height(140)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	genderChart
        .width(300)
        .height(100)
        .dimension(genderDim)
        .group(genderGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	ageSegmentChart
		.width(300)
		.height(150)
        .dimension(ageSegmentDim)
        .group(ageSegmentGroup)
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	phoneBrandChart
		.width(300)
		.height(310)
        .dimension(phoneBrandDim)
        .group(phoneBrandGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

    locationChart
    	.width(200)
		.height(510)
        .dimension(locationDim)
        .group(locationGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

    usChart.width(1000)
    .height(330)
    .dimension(locationDim)
    .group(totalDonationsByState)
    .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
    .colorDomain([0, max_state])
    .overlayGeoJson(statesJson["features"], "location", function (d) {
    	console.log(d.properties.NAME)
        return d.properties.NAME;

    })
    // .projection(d3.geo.albers()
    //             .center([0, 55.4])
			 //    .rotate([4.4, 0])
			 //    .parallels([50, 60])
			 //    .scale(1200 * 5)
			 //    .translate([1000 / 2, 330 / 2]))
	    .projection(d3.geo.mercator()
				    .center([0, -5 ])
				    .scale(900)
				    .rotate([-180,0]));

    // .title(function (p) {
    //     return "State: " + p["key"]
    //             + "\n"
    //             + "Total Donations: " + Math.round(p["value"]) + " $";
    // })




//     var map = L.map('map');

//     function getColor(d) {
//     return d > 175 ? '#800026' :
//            d > 150 ? '#BD0026' :
//            d > 125 ? '#E31A1C' :
//            d > 100 ? '#FC4E2A' :
//            d > 75 ? '#FD8D3C' :
//            d > 50 ? '#FEB24C' :
//            d > 25 ? '#FED976' :
//                     '#FFEDA0';
// }

	// var drawMap = function(){

	//     map.setView([55, -5], 5);
	// 	mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
	// 	L.tileLayer(
	// 		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	// 			attribution: '&copy; ' + mapLink + ' Contributors',
	// 			maxZoom: 15,
	// 		}).addTo(map);

	// 	// //HeatMap
	// 	// var geoData = [];
	// 	// _.each(allDim.top(Infinity), function (d) {
	// 	// 	geoData.push([d["latitude"], d["longitude"], 1]);
	//  //      });
	// 	// var heat = L.heatLayer(geoData,{
	// 	// 	radius: 10,
	// 	// 	blur: 20, 
	// 	// 	maxZoom: 1,
	// 	// }).addTo(map);

	// 	// // console.log(funnyhats)
	// 	function style(feature) {
	// 	    return {
	// 	        fillColor: getColor(locationGroup),
	// 	        weight: 2,
	// 	        opacity: 1,
	// 	        color: 'white',
	// 	        dashArray: '3',
	// 	        fillOpacity: 0.7
	// 	    };
	// 	}

	// 	console.log(locationGroup);


	// 	var chlor = L.geoJson(CountyData, {style: style}).addTo(map);
	// 	// console.log(chlor)
	// 	// var geojsonLayer = new L.GeoJSON.AJAX("Counties_December_2016_Full_Extent_Boundaries_in_England.geojson");


	// };

	// //Draw Map
	// drawMap();

	// //Update the heatmap if any dc chart get filtered
	// dcCharts = [timeChart, genderChart, ageSegmentChart, phoneBrandChart, locationChart];

	// _.each(dcCharts, function (dcChart) {
	// 	dcChart.on("filtered", function (chart, filter) {
	// 		map.eachLayer(function (layer) {
	// 			map.removeLayer(layer)
	// 		}); 
	// 		drawMap();
	// 	});
	// });

	dc.renderAll();

};