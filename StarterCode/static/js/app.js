// // Fetch the JSON data and console log it
d3.json("samples.json").then(function(data){
    console.log(data);
})
// Start up function
function startup() {
    // Select the dropdown
    let selector = d3.select("#selDataset");

    // We load data from samples.json
    d3.json("samples.json").then(function(samplesData){
        // We extract names from the loaded data
        let names = samplesData.names;

        // Code used to populate the dropdown dynamically
        selector.selectAll("option")
            .data(names)
            .enter()
            .append("option")
            .attr("value", v => v)
            .text(v => v);

        // Get initial value from the array
        let selection = names[0];

        // Build plots from initial value selection
        buildPlots(selection);
        demographics(selection);
    });
}

// Function handling changes in the dropdown
function optionChange(newID){
    // Call to build new plot from new ID
    buildPlots(newID);
    demographics(newID);
}

// Function that creates the plots based on the selected data
function buildPlots(id) {
    // Loading data from the json using a promise
    d3.json("samples.json").then(function(samplesData){
        // Filters samples based on the selected ID
        let filtered_data = samplesData.samples.filter(sample => sample.id == id);
        let result = filtered_data[0];

        // We process data to prepare for plotting
        let Data = [];

        for (let i=0; i<result.sample_values.length; i++){
            Data.push({
                id: `OTU ${result.otu_ids[i]}`,
                value: result.sample_values[i],
                label: result.otu_labels[i]
            });
        }


        // Gets the top ten values for the horizontal bar chart
        let Sorted_data = Data.sort(function compareFunction(a,b){
            return b.value - a.value;
        }).slice(0,10);
        
        // We reverse the sorted data for horizontal bar chart
        let reversed = Sorted_data.sort(function compareFunction(a,b){
            return a.value - b.value;
        })
        
        // Define trace and layout for the plot
        let traceBar = {
            type: "bar",
            orientation: "h",
            x: reversed.map(row=> row.value),
            y: reversed.map(row => row.id),
            text: reversed.map(row => row.label)
        };
        let data = [traceBar];
        let layout = {
            yaxis: {autorange: true},
        };
        
        // Using plotly we create new plot
        Plotly.newPlot("bar", data, layout);

        // Defining trace and layout for the bubble chart
        let trace1 = {
            x: result.otu_ids,
            y: result.sample_values,
            mode: "markers",
            marker: {
                size: result.sample_values,
                color: result.otu_ids,
                colorscale: "Viridis"
            },
        };
        let data1 = [trace1]
        let layout1 = {
            xaxis: {title:"OTU ID"},
            width: window.width
        };

        // Creating new bubble plot
        Plotly.newPlot("bubble", data1, layout1);
    });
}

// Displays demo for the selected ID
function demographics(id) {
    // Loads data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // The line filters metadata per selected ID
        let filtered = samplesData.metadata.filter(sample => sample.id == id);

        // We select the container for the demographics info
        let selection2 = d3.select("#sample-metadata");

        // Clearing selection
        selection2.html("");
        
        // Displaying information using h5 elements
        Object.entries(filtered[0]).forEach(([k,v]) => {
            selection2.append("h5")
                .text(`${k}: ${v}`);
        });
    })
}

startup();
