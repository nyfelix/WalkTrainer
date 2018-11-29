//Setup
//creating the chart on loading
window.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
   $('#copyModal').modal({ show: false});
   /* var tmpString;
    var saveName;
    for(var index = 0; index < Object.keys(patterns).length; index++){
        console.log(index);
        if(patterns["save"+(index+1)] === undefined || patterns["save"+(index+1)] == 0){
            tmpString = index + 1;
            saveName = "#save" + tmpString;
            $(saveName).prop('disabled',true);
        }
    }*/
   togglePatternButtons();
   disableSaveButtons();
};

function togglePatternButtons(){
    if(walking === true){
        $("#patternButtons button").attr('disabled',false);
    }
    else
    {
        $("#patternButtons button").attr('disabled',true);
    }

}

function enableSaveButtons(){
    var tmpString;
    var saveName;
    for(var index = 0; index < Object.keys(patterns).length; index++){
        tmpString = index + 1;
        saveName = "#save" + tmpString;
        $(saveName).prop('disabled',false);
    }
}

function disableSaveButtons(){
    var tmpString;
    var saveName;
    for(var index = 0; index < Object.keys(patterns).length; index++){
        //console.log(index);
        if(patterns["save"+(index+1)] === undefined || patterns["save"+(index+1)] == 0){
            tmpString = index + 1;
            saveName = "#save" + tmpString;
            $(saveName).prop('disabled',true);
        }
    }
}

$('#stepsInput').val(steps);

//contol page

$("#walkButton").click(function () {
        walking = true;
        console.log(walking);
        togglePatternButtons();
    }
);

$("#stopButton").click(function () {
        walking = false;
        console.log(walking);
        togglePatternButtons();
    }
);

//Navigating without reloading page

$("[data-nav]").click(function () {
    var pageId = $(this).attr("data-nav");
    console.log("PageID: "+ pageId);
    $("[data-nav]").removeClass("bg-secondary").filter("[data-nav = "+pageId+"]").addClass("bg-secondary");
    $("[data-page]").addClass("d-none").filter("[data-page ="+pageId+"]").removeClass("d-none");
});

//paramters page

$('#actuatorButtons button').click(function() {
    $(this).toggleClass("active");
    var index = $(this).text();
    console.log($(this).text());
    if(actuators[index])
    {
        actuators[index] = 0;
    }
    else
    {
        actuators[index] = 1;
    }
    console.log("Selected actuators "+actuators);
});

$("#uploadButton").click(function () {
    console.log(stepsInput.val());
    if(stepsInput.val() > maxSteps)
    {
        $("div .alert").removeClass("d-none");
    }
    else
    {
        $("div .alert").addClass("d-none");
        steps = stepsInput.val();
    }
    config.data.labels.splice(0,config.data.labels.length);
    for(var index = 0; index < steps; index++){
        config.data.labels[index] = STEPS[index];
    }
    pinNumber = actuators.map(getPinNumber);
    pinNumber.sort(function(a, b){return a - b});
    pinNumber = pinNumber.filter(reduceArray);
    if(actuators[0] == 1){
        pinNumber.unshift(0);
    }
    console.log("Used Pins " + pinNumber);
    console.log("Labels: " + config.data.labels);
    config.data.datasets.splice(0, config.data.datasets.length);
    for (var index = 0; index < pinNumber.length; index++) {
        var colorName = colorNames[config.data.datasets.length % colorNames.length];
        var newColor = window.chartColors[colorName];
        var newDataset = {
            label: 'Actuator ' + pinNumber[index],
            backgroundColor: newColor,
            borderColor: newColor,
            data: [],
            fill: false
        };
        for (var j = 0; j < steps; ++j) {
            newDataset.data.push(randomScalingFactor());
        }
        config.data.datasets.push(newDataset);
    }
    window.myLine.update();

});
//patterns page

$("[data-save]").click(function () {
    saveId = $(this).attr('data-save');
    console.log("SaveID: " + saveId);

    if(saveSelected == true){
        for(var index = 0; index <pinNumber.length; index++){
            for(var j = 0; j < config.data.datasets[index].data.length; j++){
                config.data.datasets[index].data[j].toFixed(0) ;
            }
            patterns['save'+saveId][index] = [];
            patterns['save' + saveId][index] = config.data.datasets[index].data.filter(copyArray);
        }
        $("#cancelButton").trigger("click");
    }

    if(copySelected == true){
        $(this).addClass("active");
        switch (saveId){
            case '1':
                $("#firstCopyButton").text("Pattern 2").attr('data-copy','2');
                $("#secondCopyButton").text("Pattern 3").attr('data-copy','3');
                break;
            case '2':
                $("#firstCopyButton").text("Pattern 1").attr('data-copy','1');
                $("#secondCopyButton").text("Pattern 3").attr('data-copy','3');
                break;
            case '3':
                $("#firstCopyButton").text("Pattern 1").attr('data-copy','1');
                $("#secondCopyButton").text("Pattern 2").attr('data-copy','2');
        }
        $("#modalLabel").html("Copying Pattern " + saveId);
        $("#copyModal").modal('show').attr('data-selected', saveId);
    }

    if(saveSelected == false && copySelected == false && clearSelected == false){
        for(var index = 0; index <pinNumber.length; index++){
            config.data.datasets[index].data = [];
            config.data.datasets[index].data = patterns['save'+saveId][index].filter(copyArray);
        }
    }

    disableSaveButtons();
    //console.log($(this).attr("id"));
    window.myLine.update();
    //console.log(patterns['save' + saveId]);
});

$("#copyModal button").click(function () {                              //copying one pattern to another
    copyId = $(this).attr("data-copy");
    for(var index = 0; index < pinNumber.length; index++){
        patterns['save'+copyId][index] = patterns['save'+saveId][index].filter(copyArray);
    }
    //patterns['save'+copyId] = patterns['save'+saveId];
    enableSaveButtons();
    $("#cancelButton").trigger("click");
    console.log("CopyID: " + copyId);
});

$("#saveButton").click(function () {
    saveSelected = true;
    $("#copyButton, #clearButton").prop("disabled", true);
    $("#cancelButton").removeClass("d-none");

    enableSaveButtons();
});

$("#copyButton").click(function () {
    copySelected = true;
    $("#saveButton, #clearButton").prop("disabled", true);
    $("#cancelButton").removeClass("d-none");

    enableSaveButtons();
    disableSaveButtons();
});

$("#clearButton").click(function () {
    copySelected = true;
    $("#saveButton, #copyButton").prop("disabled", true);
    $("#cancelButton").removeClass("d-none");
});

$("#cancelButton").click(function () {
    $("#saveButton, #copyButton, #clearButton").prop("disabled",false);
    saveSelected = false;
    copySelected = false;
    clearSelected = false;
    $("#cancelButton").addClass("d-none");
    disableSaveButtons();
});

//charts.js functions for comparing

var colorNames = Object.keys(window.chartColors);