/*
This file has all the functions and event-listeners needed.
This has to be included AFTER definitions.js
*/

$(document).ready(function () {
    $("#successAlert,#expSuccessAlert").hide().removeClass("d-none"); //otherwise you''ll see the alert shortly at the beginning
    $("#failAlert,#expFailAlert").hide().removeClass("d-none");
    }
);

window.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d'); //these lines are needed to load the chart
    window.myLine = new Chart(ctx, config);                       //these lines are needed to load the chart
    //needs to be added otherwise the modal will be displayed without any interactions
   $('#copyModal').modal({ show: false});
   //takes items out of localStorage and assigns to the belonging variable
   if(localStorage.getItem("actuators") !== null){
       actuators = JSON.parse(localStorage.getItem("actuators"));
       actuators.forEach(function (value,index,array) {
           if(array[index] == 1){
               $("[data-actuator = "+index+"]").addClass('active');
           }
       })
       pinNumber = actuators.map(getPinNumber);
       pinNumber.sort(function(a, b){return a - b});
       pinNumber = pinNumber.filter(reduceArray);
   }

   for(var index = 1; index <= 3; index++){
       if(localStorage.getItem("save" + index) !== null){
           patterns["save"+index] = JSON.parse(localStorage.getItem("save" + index));
       }
   }

    if(localStorage.getItem("steps") !== null){
       steps = parseInt(JSON.parse(localStorage.getItem("steps")));
        $('#stepsInput').val(steps);
    }

    if(localStorage.getItem("cycleTime") !== null){
        cycleTime = parseInt(JSON.parse(localStorage.getItem("cycleTime")));
        $("#cycleTime,#expCycleTime").val(cycleTime);
    }

    if(localStorage.getItem("ipAdress") !== null){
       ipAdress = JSON.parse(localStorage.getItem("ipAdress"));
       $("#ipInput").val(ipAdress);
    }

    if(localStorage.getItem("expMode") !== null){
        expMode = JSON.parse(localStorage.getItem("expMode"));
        document.getElementById("toggleButton").checked= expMode;
        $("#toggleButton").trigger("change");
    }

   togglePatternButtons();
   disableSaveButtons();
    window.myLine.update();
};

//disables/enables patterns, walk and stop buttons on the "controls"-tab depending on the walking state
function togglePatternButtons(){
    if(stop == true){
        for(var index = 1; index <= 3; index++){
            if(patterns["save"+(index)] !== undefined && patterns["save"+(index)] != 0){
                $("[data-pattern = "+index+"]").attr('disabled',false);
            }
        }
        $("#walkButton, #expWalkButton").attr('disabled',false);
        $("#stopButton, #expStopButton").attr('disabled',true);
    }
    else
    {
        $("[data-pattern]").attr('disabled',true);
        $("#walkButton, #expWalkButton").attr('disabled',true);
        $("#stopButton, #expStopButton").attr('disabled',false);
    }

}

//enables all saveButtons on paramater-tab
function enableSaveButtons(){
    var tmpString;
    var saveName;
    for(var index = 0; index < Object.keys(patterns).length; index++){
        tmpString = index + 1;
        saveName = "#save" + tmpString;
        $(saveName).prop('disabled',false);
    }
}

//disables saveButtons which have no pattern assigned to them
function disableSaveButtons(){
    var tmpString;
    var saveName;
    for(var index = 0; index < Object.keys(patterns).length; index++){
        if(patterns["save"+(index+1)] === undefined || patterns["save"+(index+1)] == 0){
            tmpString = index + 1;
            saveName = "#save" + tmpString;
            $(saveName).prop('disabled',true);
        }
    }
}

//*********************************************************************************************************************
//contol page
//*********************************************************************************************************************

//for making the robot walk
$("#walkButton,#expWalkButton").click(function () {
        stop = false;
        togglePatternButtons();
        $("#patternsManipulateButtons button").attr("disabled", true);
        ipAdress = $("#ipInput").val();
        $.post("http://" + ipAdress + "/setPattern", JSON.stringify({
            stop: stop
        }));
    }
);

//for making the robot stop
$("#stopButton,#expStopButton").click(function () {
        stop = true;
        togglePatternButtons();
        $("#patternsManipulateButtons button").attr("disabled",false);
        disableSaveButtons();
    ipAdress = $("#ipInput").val();
    $.post("http://" + ipAdress + "/setPattern", JSON.stringify({
        stop: stop
    }));
    }
);

//for uploading patterns, cycleTime, steps, pinNumber, countActuators
$("[data-pattern]").click(function () {
    var patternId = $(this).attr("data-pattern");
    ipAdress = $("#ipInput").val();
    localStorage.setItem("ipAdress", JSON.stringify(ipAdress));
    if (expMode == true) {
        cycleTime = $("#expCycleTime").val();
    }
    else {
        cycleTime = $("#cycleTime").val();
    }
    $("#cycleTime,#expCycleTime").val(cycleTime);
    if (!($("#cycleTime").val() == "")) {
        localStorage.setItem("cycleTime", cycleTime);
    }
    $("#spinner").removeClass("d-none");    //add loading spinner
    $("#content").addClass("disable-content");  //blurs the whole page
    $.ajaxSetup({
        timeout: 10000  //how long to wait before the browser decides that the connection failed due timeout
    });

    //sending request
    $.post("http://" + ipAdress + "/setPattern", JSON.stringify({
        steps: steps,
        cycleTime: cycleTime,
        patterns: patterns["save" + patternId],
        pinNumber: pinNumber,
        countActuators: pinNumber.length
    }), function (data) {
        $("#spinner").addClass("d-none");
        $("#content").removeClass("disable-content");
        if (data.result == true) {                                          //in case of a successful connection
            $("#successAlert,#expSuccessAlert").fadeTo(2000, 500).slideUp(500, function () {
                $("#successAlert,#expSuccessAlert").slideUp(500);
            });
        }
    }).fail(function () {                                                  //in case of a failed connection due timeout
        console.log("fail");
        $("#spinner").addClass("d-none");
        $("#content").removeClass("disable-content");
        $("#failAlert,#expFailAlert").fadeTo(2000, 500).slideUp(500, function () {
            $("#failAlert,#expFailAlert").slideUp(500);
        });
    });
});




//*********************************************************************************************************************
//configurations page
//*********************************************************************************************************************

//to find out which pins are enabled
$('#actuatorButtons button').click(function() {
    $(this).toggleClass("active");
    var index = $(this).text();
    actuators[index] = actuators[index] ? 0: 1;
});

//assigns number of steps to it's variable; passes steps & nr of actuators to the chart on "patterns"
// and updates it with random values
$("#saveConfigButton").click(function (e) {
    e.preventDefault();
    console.log($("#stepsInput").val());
    if($("#stepsInput").val() > maxSteps)     //checking if the input doesn't exceed the MAX value
    {
        $("#stepsAlert").removeClass("d-none");
        return;
    }
    else if($("#stepsInput").val() != "")
    {
        $("#stepsAlert").addClass("d-none");
        steps = $("#stepsInput").val();
        localStorage.setItem("steps",steps);
    }
    config.data.labels.splice(0,config.data.labels.length);
    for(var index = 0; index < steps; index++){             //getting the right amount of labels for the horizontal axis
        config.data.labels[index] = STEPS[index];
    }

    pinNumber = actuators.map(getPinNumber);        //getting the index of all the elements with "1" in it
    pinNumber.sort(function(a, b){return a - b});   //sorting array from small to big so you can remove all zeros
    pinNumber = pinNumber.filter(reduceArray);      //removing all elements with "0" in it
    if(actuators[0] == 1){                          //if pin 0 was selected, it will be deletet in the line above, so this is to undo it
        pinNumber.unshift(0);
    }

    //pushing  new randomized datasets for  the charts; number of datasets depends number of actuators
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

    localStorage.setItem("actuators",JSON.stringify(actuators));
    window.myLine.update();
});

//*********************************************************************************************************************
//patterns page
//*********************************************************************************************************************

//toggle experimental mode
$("#toggleButton").on('change', function() {
    if ($(this).is(':checked')) {
        $("#expButtons").removeClass("d-none");
        expMode = true;
        localStorage.setItem("expMode", JSON.stringify(expMode));
    }
    else {
        $("#expButtons").addClass("d-none");
        expMode = false;
        localStorage.setItem("expMode", JSON.stringify(expMode));
    }});

//event handler for clicking on the patterns buttons
$("[data-save]").click(function () {
    saveId = $(this).attr('data-save');
    console.log("SaveID: " + saveId);

    //displays the pattern saved in the corresponding button
    if(saveSelected == false && copySelected == false && clearSelected == false){
        for(var index = 0; index <pinNumber.length; index++){
            config.data.datasets[index].data = [];
            config.data.datasets[index].data = patterns['save'+saveId][index].filter(copyArray);
        }
        if(expMode){                                    //if experimental mode is on, it uploads the pattern directly
            cycleTime = $("#expCycleTime").val();
            if(!($("#cycleTime").val() == "")){
                localStorage.setItem("cycleTime", cycleTime);
            }
            $("[data-pattern ="+saveId+"]").trigger("click"); // this triggers the upload
        }
    }
    //saving displayed values on the chart into the pattern object
    if(saveSelected == true){
        for(var index = 0; index <pinNumber.length; index++){
            for(var j = 0; j < config.data.datasets[index].data.length; j++){
                config.data.datasets[index].data[j] = parseInt(config.data.datasets[index].data[j]).toFixed(0) ;
            }
            patterns['save'+saveId][index] = [];
            patterns['save' + saveId][index] = config.data.datasets[index].data.filter(copyArray);
        }
        localStorage.setItem("save"+saveId, JSON.stringify(patterns["save"+saveId]));
        $("#saveButton").trigger("click");
    }

    //opens a window to choose to which pattern button to copy to
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

    //clearing a save
    if(clearSelected == true){

       patterns['save'+saveId] = [];
       localStorage.removeItem("save"+saveId);
       $("#clearButton").trigger("click");
    }

    disableSaveButtons();
    window.myLine.update();
});

//copies on save to another
$("#copyModal button").click(function () {
    copyId = $(this).attr("data-copy");
    for(var index = 0; index < pinNumber.length; index++){
        patterns['save'+copyId][index] = patterns['save'+saveId][index].filter(copyArray);
    }
    enableSaveButtons();
    $("#copyButton").trigger("click");
});

// for transforming save button to an cancel button and back
$("#saveButton").click(function () {
    if(saveSelected === false){
        saveSelected = true;
        $("#copyButton, #clearButton").prop("disabled", true);
        $(this).toggleClass("btn-success btn-danger").html("Cancel");
        enableSaveButtons();
    }
    else{
        saveSelected = false;
        $(this).toggleClass("btn-success btn-danger").html("Save to");
        $("#saveButton, #copyButton, #clearButton").prop("disabled",false);
        disableSaveButtons();
    }
});

// for transforming copy button to an cancel button and back
$("#copyButton").click(function () {
    if(copySelected === false){
        copySelected = true;
        $("#saveButton, #clearButton").prop("disabled", true);
        $(this).toggleClass("btn-danger btn-warning").html("Cancel");
        enableSaveButtons();
        disableSaveButtons();
    }
    else {
        copySelected = false;
        $(this).toggleClass("btn-danger btn-warning").html("Copy");
        $("#saveButton, #copyButton, #clearButton").prop("disabled",false);
        disableSaveButtons();
    }

});

// for transforming clear button to an cancel button and back
$("#clearButton").click(function () {
    if(clearSelected === false){
        clearSelected = true;
        $("#saveButton, #copyButton").prop("disabled", true);
        $(this).toggleClass("btn-danger btn-primary").html("Cancel");
        enableSaveButtons();
        disableSaveButtons();
    }
    else {
        clearSelected = false;
        $(this).toggleClass("btn-danger btn-primary").html("Clear");
        $("#saveButton, #copyButton, #clearButton").prop("disabled",false);
        disableSaveButtons();
    }
});

//*********************************************************************************************************************
//other functions
//*********************************************************************************************************************

//Navigating without reloading page by disabling content
$("[data-nav]").click(function () {
    var pageId = $(this).attr("data-nav");
    console.log("PageID: "+ pageId);
    $("[data-nav]").removeClass("bg-secondary").filter("[data-nav = "+pageId+"]").addClass("bg-secondary");
    $("[data-page]").addClass("d-none").filter("[data-page ="+pageId+"]").removeClass("d-none");
});