function init(){
  //Data document
  const coronaDataFile = "coviddata/06102020/full_data.csv"; // GET from URL: https://ourworldindata.org/coronavirus-source-data
  const coronaRecoverCasesDataFile = "coviddata/06102020/full_data2.csv"; // GET from URL: https://www.kaggle.com/imdevskp/corona-virus-report/data?select=country_wise_latest.csv&fbclid=IwAR0LaxnACL-cBH4zW3lX_lJuyKUYAJI_1ZunVTqoVD1IYrF2gZtRggu-4ZQ
  const worldMapDataFile = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  const testFile = "coviddata/06102020/test.csv"; // GET from URL: https://ourworldindata.org/coronavirus-source-data

  var w = 1200;
  var h = 700;
  var dataset = [];
  var unhandleData = [];
  var dataset2 = [];
  var dataset3 = [];
  var countryNameList = [];
  var selectedCountryNameList = [];
  var currentCountry = null;
  var currentMetric = "total_cases";
  var toDate = "10/06/2020";

  var totalConfirmedCases = 0;
  var totalFatalCases = 0;
  var totalRecoveredCases = 0;
  var totalActiveCases = 0;

  // Format number with commas
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function UpdateOverview(){
    document.getElementById("totalConfirmedCases").textContent= numberWithCommas(totalConfirmedCases);
    document.getElementById("totalFatalCases").textContent= numberWithCommas(totalFatalCases);
    document.getElementById("totalRecoveredCases").textContent= numberWithCommas(totalRecoveredCases);
    totalActiveCases = totalConfirmedCases - (totalFatalCases + totalRecoveredCases);
    document.getElementById("totalActiveCases").textContent= numberWithCommas(totalActiveCases);
  }

  var projection = d3.geoMercator()
                    .translate([w/2, h/2])
                    .scale(115);

  var path = d3.geoPath()
              .projection(projection);

  // Geo MAP
  var svg = d3.select("#map")
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "graph-svg-component");


//----------------------Draw Visualisation-------------------------------------------

//---------------------Generate corona map-------------------------------------
  const g = svg.append("g");
  //Load Data And run the program
  Promise.all([
    d3.csv(coronaDataFile),
    d3.csv(coronaRecoverCasesDataFile),
    d3.json(worldMapDataFile),
    d3.csv(testFile)
    ]).then(function(files) {
        // files[0] will contain coronaDataFile
        unhandleData = files[0];
        // files[1] will contain coronaRecoverCasesDataFile
        dataset2 = files[1];
        // files[3] will testFile
        files[3].forEach((d) => {
          var dateString = d.date; // Oct 23
          var dateParts = dateString.split("/");
          // month is 0-based, that's why we need dataParts[1] - 1
          var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
          d.date = dateObject;
          d.total_cases = parseInt(d.total_cases);
        });
        dataset3 = files[3];
        // files[2] will contain worldMapDataFile
        const countries = topojson.feature(files[2], files[2].objects.countries).features;
        drawMap(countries);
    }).catch(function(err) {
        // handle error here
    })


  function drawMap(countries){
    // Binding data value from csv to location on Map
    var dateString2 = toDate; // Oct 23
    var dateParts2 = dateString2.split("/");
    // month is 0-based, that's why we need dataParts[1] - 1
    var dateObject2 = new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0]).setHours(0,0,0,0);
    // Get record on 10/06/2020
    for(var a = 0; a < unhandleData.length; a++){
        var dateString = unhandleData[a].date; // Oct 23
        var dateObject = moment(dateString, 'YYYY-MM-DD').toDate().setHours(0,0,0,0);
        if(dateObject == dateObject2){
          dataset.push(unhandleData[a]);
        }
    }

    for(var j = 0; j<countries.length; j++){
      var jsonLocationName = countries[j].properties['name'];
      for(var i = 0; i<dataset.length; i++){
        var dataCountryName = dataset[i].location;
        var dataTotalCases = parseInt(dataset[i].total_cases);
        var dataTotalDeaths= parseInt(dataset[i].total_deaths);
        var dataNewCases = parseInt(dataset[i].new_cases);
        var dataNewDeaths = parseInt(dataset[i].new_deaths);

        if(jsonLocationName == "United States of America"){
          jsonLocationName = "United States";
        }
        if(jsonLocationName == "Dem. Rep. Congo"){
          jsonLocationName = "Democratic Republic of Congo";
        }
        if(jsonLocationName == "S. Sudan"){
          jsonLocationName = "South Sudan";
        }
        if(jsonLocationName == "Central African Rep."){
          jsonLocationName = "Central African Republic";
        }
        if(jsonLocationName == "W. Sahara"){
          jsonLocationName = "Western Sahara";
        }
        if(jsonLocationName == "Côte d'Ivoire"){
          jsonLocationName = "Cote d'Ivoire";
        }
        if(jsonLocationName == "Bosnia and Herz."){
          jsonLocationName = "Bosnia and Herzegovina";
        }
        if(jsonLocationName == "Dominican Rep."){
          jsonLocationName = "Dominican Republic";
        }
        if(jsonLocationName == "Timor-Leste"){
          jsonLocationName = "Timor";
        }
        if(jsonLocationName == "Eq. Guinea"){
          jsonLocationName = "Equatorial Guinea";
        }
        if(jsonLocationName == "Czechia"){
          jsonLocationName = "Czech Republic";
        }
        if(jsonLocationName == "Falkland Is."){
          jsonLocationName = "Falkland Islands";
        }

        if(jsonLocationName == dataCountryName){
          countryNameList.push(dataCountryName);
          countries[j].properties['total_cases'] = dataTotalCases;
          countries[j].properties['total_deaths'] = dataTotalDeaths;
          countries[j].properties['new_cases'] = dataNewCases;
          countries[j].properties['new_deaths'] = dataNewDeaths;
          totalConfirmedCases += dataTotalCases;
          totalFatalCases += dataTotalDeaths;
          break;
        }
        else{
          countries[j].properties['total_cases'] = 0;
          countries[j].properties['total_deaths'] = 0;
          countries[j].properties['new_cases'] = 0;
          countries[j].properties['new_deaths'] = 0;
        }
      }

      for(var i = 0; i<dataset2.length; i++){
        var dataCountryName = dataset2[i]['Country/Region'];
        // Processing conflict names
        var dataTotalRecoveredCases = parseInt(dataset2[i].Recovered);
        if(jsonLocationName == "United States"){
          jsonLocationName = "US";
        }
        if(jsonLocationName.localeCompare(dataCountryName) == 0){
          countries[j].properties['total_recovered_cases'] = dataTotalRecoveredCases;
          totalRecoveredCases += dataTotalRecoveredCases;
          break;
        }
        else{
          countries[j].properties['total_recovered_cases'] = 0;
        }
      }
    }

    //Update Overview information
    UpdateOverview();
    // render country selection
    renderCountryOption(countryNameList);
    // Set up color range
    var maxValue =   d3.max(dataset,function(d){
                      return d;
                    });
    var legendLabels = ["< 100", "100+", "1,000+", "10,000+", "50,000+","100,000+", "500,000+", "> 1,000,000"]
    var color = d3.scaleThreshold()
      .domain([0, 100, 1000, 10000, 50000, 100000, 500000, 1000000])
      .range(d3.schemeOranges[9]);

    // Draw MAP
    g.selectAll("g")
      .data(countries)
      .enter()
      .append("path")
      .attr( "d", path )
      .attr("class", "country")
      .attr("fill", function(d, i){
          return color(d.properties['total_cases'])
      })
      .on('mouseover', (d) => {
        var message = d.properties['name']
                    + "\nConfirmed cases: " + d.properties['total_cases']
                    + "\nFatal cases: " + d.properties['total_deaths']
                    + "\nNew confirmed cases: " + d.properties['new_cases']
                    + "\nNeu fatal cases: " + d.properties['new_deaths'];
        HandleHoverLocation(d);
        drawPieChart(d);
      })
      .on('mouseout', function(d) {
        svg.selectAll("#detail_data")
          .style('visibility', 'hidden');
        svg.selectAll(".detail_text")
          .style('visibility', 'hidden');
        svg.selectAll("g.arc").remove();
      })
      .append("title")
      .text(d => {
        var message = d.properties['name']
                    + "\nConfirmed cases: " + d.properties['total_cases'];
        return message;
      });

    // Adding legend
    var legend = svg.selectAll("g.legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend");

    var lw = 20, lh = 20;
    legend.append("rect")
    .attr("x", 20)
    .attr("y", function(d, i){ return h - (i*lh) - 2*lh;})
    .attr("width", lw)
    .attr("height", lh)
    .style("fill", function(d, i) { return color(d); })
    .style("opacity", 0.8);

    legend.append("text")
    .attr("x", 50)
    .attr("y", function(d, i){ return h - (i*lh) - lh - 4;})
    .text(function(d, i){ return legendLabels[i]; });
  }


  // Display details information for each country
  function HandleHoverLocation(inputdata){

    var xBox = 30;
    var yBox = 30;
    var widthBox = 250;
    var heightBox = 150;

    var xText = xBox + 10;
    var yText = yBox + 30;
    var boxColor = "white";

    var line1 = inputdata.properties['name']
    var line2 = "Confirmed: ";
    var line2Value = inputdata.properties['total_cases'];
    var line3 = "Fatal: ";
    var line3Value = inputdata.properties['total_deaths'];
    var line4 = "Recovered: ";
    var line4Value = inputdata.properties['total_recovered_cases'];
    var locationActiveCases = inputdata.properties['total_cases'] - (inputdata.properties['total_deaths'] + inputdata.properties['total_recovered_cases']);
    var line5 = "Acvite: ";
    var line5Value = locationActiveCases;
    var line6 = "New confirmed: ";
    var line6Value = inputdata.properties['new_cases'];
    var line7 = "New fatal: " ;
    var line7Value = inputdata.properties['new_deaths'];


  //   return "red";
  // }
  // if(i == 1){
  //   return "green";
  // }
  // if(i == 2){
  //   return "#e6e600";
  // }
    svg.selectAll("#detail_data").remove();
    svg.selectAll(".detail_text").remove();
    if(inputdata != null){
      //Add Rectangle
      svg.append("rect")
        .attr("id", "detail_data")
        .attr("x", xBox)
        .attr("y", yBox)
        .attr("width", widthBox)
        .attr("height", heightBox)
        .attr("fill-opacity","0.5")
        .attr("fill",boxColor);
      // Add Text
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .style('font-weight', 'bold')
        .text(line1);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "2em")
        .style("fill", "#b36b00")
        .text(line2);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "2em")
          .style("fill", "#b36b00")
          .text(line2Value);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "3em")
        .style("fill", "red")
        .text(line3);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "3em")
          .style("fill", "red")
          .text(line3Value);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "4em")
        .style("fill", "green")
        .text(line4);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "4em")
          .style("fill", "green")
          .text(line4Value);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "5em")
        .style("fill", "#e6e600")
        .text(line5);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "5em")
          .style("fill", "#e6e600")
          .text(line5Value);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "6em")
        .style("fill", "#595959")
        .text(line6);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "6em")
          .style("fill", "#595959")
          .text(line6Value);
      svg.append("text")
        .attr("class", "detail_text")
        .attr("x", xText)
        .attr("y", yText)
        .attr("dy", "7em")
        .style("fill", "#595959")
        .text(line7);
        svg.append("text")
          .attr("class", "detail_text")
          .attr("x", xText + 145)
          .attr("y", yText)
          .attr("dy", "7em")
          .style("fill", "#595959")
          .text(line7Value);
    }
  }

  // Map zooming function
  svg.call(d3.zoom().scaleExtent([1, 50]).on("zoom", () => {
    g.attr('transform', d3.event.transform);
  }));



//-------------------------------------Line chart---------------------------------//

function addRadioButton(id, value, label){
  var lineChartMetricOption = document.getElementById('metricSelection');
  var metricLabel = document.createTextNode(" "+label);
  var radioButton = document.createElement('input');
  var metric = document.createElement("label");
  radioButton.type = "radio";
  radioButton.name = "metric";
  radioButton.value = value;
  radioButton.id = id;
  if(String(value) == "total_cases"){
    radioButton.checked = "checked";
  }
  radioButton.addEventListener("click", function(){
    var option = String(this.value);
    var country = String(this.value);
    currentMetric = option;
    if(this.checked){
      if (selectedCountryNameList.indexOf(country) > -1) {
          //In the array!
      } else {
          //Not in the array
          // Add item
      }
    }
    else{
      if (selectedCountryNameList.indexOf(country) > -1) {
          //In the array!
          // Remove Item fromt the array
      } else {
          //Not in the array
      }
    }
    drawLineChart();
  });

  metric.appendChild(radioButton);   // add the box to the element
  metric.appendChild(metricLabel);// add the description to the element
  metric.style ="max-height:200px; max-width:50px; overflow: auto; margin-right: 10px;";
  drawLineChart();
  lineChartMetricOption.appendChild(metric);
}


  function renderCountryOption(input){
    input.sort();
    var lineChartCountryOption = document.getElementById('countrySelection');

    var countryList = document.createElement('ul');
    countryList.style = "list-style-type: none; max-height:350px; max-width:350px; overflow: auto; margin-left: 0px; padding-top: 10px; color: #a6a6a6;";
    var countryOption;

    addRadioButton("total_cases", "total_cases", "Confirmed cases");
    addRadioButton("total_deaths", "total_deaths", "Confirmed deaths");
    addRadioButton("new_cases", "new_cases", "New cases");
    addRadioButton("new_deaths", "new_deaths", "New fatal cases");

    // Generate country selection
    for(var i = 0; i<input.length; i++){
      var description = document.createTextNode(" "+input[i]);
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.name = input[i];
      checkbox.value = input[i];
      checkbox.id = "id" + input[i];
      // Initially shows the data of America, Australia, Canada, China, Russia

      if(String(checkbox.value) == "United States"){
        checkbox.checked = "checked";
        if (selectedCountryNameList.indexOf(checkbox.value) > -1) {
            //In the array!
        } else {
            selectedCountryNameList.push(checkbox.value);
        }
      }
      if(String(checkbox.value) == "Australia"){
        checkbox.checked = "checked";
        if (selectedCountryNameList.indexOf(checkbox.value) > -1) {
            //In the array!
        } else {
            selectedCountryNameList.push(checkbox.value);
        }
      }
      if(String(checkbox.value) == "Canada"){
        checkbox.checked = "checked";
        if (selectedCountryNameList.indexOf(checkbox.value) > -1) {
            //In the array!
        } else {
            selectedCountryNameList.push(checkbox.value);
        }
      }
      if(String(checkbox.value) == "China"){
        checkbox.checked = "checked";
        if (selectedCountryNameList.indexOf(checkbox.value) > -1) {
            //In the array!
        } else {
            selectedCountryNameList.push(checkbox.value);
        }
      }
      if(String(checkbox.value) == "Russia"){
        checkbox.checked = "checked";
        if (selectedCountryNameList.indexOf(checkbox.value) > -1) {
            //In the array!
            // Remove Item fromt the array
        } else {
            selectedCountryNameList.push(checkbox.value);
        }
      }

      checkbox.addEventListener("click", function(){
        var country = String(this.value);
        if(this.checked){
          if (selectedCountryNameList.indexOf(country) > -1) {
              //In the array!
          } else {
              //Not in the array
              // Add item
              if(selectedCountryNameList.length < 5){
                selectedCountryNameList.push(country);
              }
              else{
                this.checked = false;
                alert("You can only observe 5 countries at a time.\nPlease uncheck the selected options!");
              }

          }
        }
        else{
          if (selectedCountryNameList.indexOf(country) > -1) {
              //In the array!
              // Remove Item fromt the array
              selectedCountryNameList = selectedCountryNameList.filter(e => e !== country);
          } else {
              //Not in the array
          }
        }
        drawLineChart();
        isChecked(this);
      });
      var label = document.createElement("label");
      label.appendChild(checkbox);   // add the box to the element
      label.appendChild(description);// add the description to the element
      isChecked(checkbox);
      countryOption = document.createElement('li'); // create a new list item
      countryOption.style = "margin-bottom: 4px;";
      countryOption.appendChild(label); // append the text to the li
      countryList.appendChild(countryOption); // append the list item to the ul

    }
    drawLineChart();
    lineChartCountryOption.appendChild(countryList);
  }

  function isChecked(item) {
      item.parentNode.style.color = (item.checked) ? 'orange' : '#a6a6a6';
  }

  var width = w - 400;
  var height = h - 247;
  var yPadding = 100;
  var xPadding = 150;
  var svg2 = d3.select("#lineChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  var svg3 = d3.select("#chartColorLegend")
      .append("svg")
      .attr("width", 250)
      .attr("height", 500)

  function lineChart(input) {
    var colorValue = d => d.location;
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // Define X and Y scale for line chart
    var xScale = d3.scaleTime()
                  .domain([
                    d3.min(input, function(d){
                      return d.date;}),
                    d3.max(input, function(d){
                      return d.date;})
                  ])
                  .range([xPadding,width]);
    var yScale = null;


    switch(currentMetric) {
      case "total_deaths":
      yScale = d3.scaleLinear()
                .domain([
                  0,
                  d3.max(input, function(d){return parseInt(d.total_deaths);})
                ])
                .range([height - yPadding, 0]);
      break;
      case "new_cases":
      yScale = d3.scaleLinear()
                .domain([
                  0,
                  d3.max(input, function(d){return parseInt(d.new_cases);})
                ])
                .range([height - yPadding, 0]);
      break;
      case "new_deaths":
      yScale = d3.scaleLinear()
                .domain([
                  0,
                  d3.max(input, function(d){return parseInt(d.new_deaths);})
                ])
                .range([height - yPadding, 0]);
      break;
      default:
      yScale = d3.scaleLinear()
                .domain([
                  0,
                  d3.max(input, function(d){return parseInt(d.total_cases);})
                ])
                .range([height - yPadding, 0]);
    }

    const nested = d3.nest()
                    .key(colorValue)
                    .entries(input);
    colorScale.domain(nested.map(d=>d.key));
    // Define Line
    var lineGenerator = d3.line()
                .x(function(d){

                  return xScale(d.date);
                })
                .y(function(d){
                  switch(currentMetric) {
                    case "total_deaths":
                      return yScale(parseInt(d.total_deaths));
                    break;
                    case "new_cases":
                      return yScale(parseInt(d.new_cases));
                    break;
                    case "new_deaths":
                      return yScale(parseInt(d.new_deaths));
                    break;
                    default:
                      return yScale(parseInt(d.total_cases));
                  }
                });

    // Draw Lines
    svg2.selectAll("*").remove();


    svg2.selectAll("line")
      .data(nested)
      .enter()
      .append("path")
      .attr("id", d => d.key)
      .attr("class", function(d){
        switch(currentMetric) {
          case "new_cases":
            return "line2";
          break;
          case "new_deaths":
            return "line2";
          break;
          default:
            return "line";
        }
      })
      .attr("value", d => d.key)
      .attr("d", d => lineGenerator(d.values))
      .attr("stroke", d => colorScale(d.key))
      .append("title")
      .text(d => {
        var message = d.key;
        return message;
      });


    // Draw X and Y axis
    var xAxis = d3.axisBottom()
                  .ticks(5)
                  .scale(xScale);

    var yAxis = d3.axisLeft()
                  .ticks(7)
                  .scale(yScale);

    svg2.append("g")
        .attr("transform", "translate(0, "+ (height - yPadding) +")")
        .style("font-size","16px")
        .call(xAxis);

    svg2.append("g")
        .attr("transform", "translate (" + xPadding + ", 0)")
        .style("font-size","16px")
        .call(yAxis);

    // now add titles to y axis
    svg2.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .style("font-size","20px")
        .attr("transform", "translate("+ (100/2) +","+(height/2 - 78)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Number of cases");

   //Define color legends
    svg3.selectAll("*").remove();
    svg3.append("g")
        .attr("transform", "translate(100, "+ height/2 +")")
        .call(colorLegend, {
          colorScale,
          circleRadius: 15,
          spacing: 38,
          textOffset: 30
        });
  }

  function drawLineChart(){
    var selectedDataSet = [];
    if(selectedCountryNameList.length >0)
    {
      for(var j = 0; j < dataset3.length; j++){
        var locDataName = String(dataset3[j].location);
        for(var i = 0; i < selectedCountryNameList.length; i++){
          if(selectedCountryNameList[i] == locDataName){
            selectedDataSet.push(dataset3[j]);
          }
        }
      }
    }
    else{
    }
    lineChart(selectedDataSet);
  }

  function drawPieChart(inputdata){
    var w = 500;
    var h = 500;
    // "activecase" style="color: #e6e600;
    //"fatalcase" style="color: red;
    // "recoveredcase" style="color: green;
    var fatal = inputdata.properties['total_deaths'];
    var recovered = inputdata.properties['total_recovered_cases'];
    var active = inputdata.properties['total_cases'] - (inputdata.properties['total_deaths'] + inputdata.properties['total_recovered_cases']);

    var dataList = [parseInt(fatal),parseInt(recovered), parseInt(active)];
    var outerRadius = 50;
    var innerRadius = 0;

    var arc = d3.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);

    var pie = d3.pie();

    var arcs = svg.selectAll("g.arc")
                  .data(pie(dataList))
                  .enter()
                  .append("g")
                  .attr("class", "arc")
                  .attr("transform", "translate(" + 80 + "," + 250 + ")")
                  .style("opacity", 0.8);;

  //  var color = d3.scaleOrdinal(d3.schemeCategory10);

    arcs.append("path")
        .attr("fill", function(d,i){
          if(i == 0){
            return "red";
          }
          if(i == 1){
            return "green";
          }
          if(i == 2){
            return "#e6e600";
          }
        })
        .attr("d", function(d,i){
          return arc(d,i);
        });
  }

  // Color legend
  function colorLegend (selection, props) {
    const{
      colorScale,
      circleRadius,
      spacing,
      textOffset,
    } = props;
    const groups = selection.selectAll("g")
                            .data(colorScale.domain());
    const groupsEnter = groups.enter().append("g");
    var oldColor;
    groupsEnter.merge(groups)
                .attr("transform", (d,i) =>
                "translate(0, "+ (i * spacing) +")")
                //Hover color legend effect
                .on('mouseover', (d) => {
                  var element = document.getElementById(d);
                  oldColor = String(element.style.stroke);
                  element.style.stroke = "#e65c00";
                  element.style.strokeWidth = 10;
                  switch(currentMetric) {
                    case "new_cases":

                    break;
                    case "new_deaths":

                    break;
                    default:
                      element.style.strokeDasharray = 15; // make the stroke dashed
                  }

                })
                .on('mouseout', function(d) {
                  var element = document.getElementById(d);
                  element.style.strokeDasharray = null;
                  element.style.stroke = oldColor;
                  element.style.strokeWidth = null;
                });
    groups.exit().remove();

    groupsEnter.append("circle")
                .merge(groups.select("circle"))
                .attr("r", circleRadius)
                .attr("fill", colorScale);
    groupsEnter.append("text")
                .merge(groups.select("text"))
                .text(function(d){
                  return d;
                })
                .attr("dy", "0.32em")
                .attr("x", textOffset);
  }
}


window.onload = init;
