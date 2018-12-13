//Setup
//creating the chart on loading
$(document).ready(function () {
    $("#successAlert").hide();
    $("#successAlert").removeClass("d-none");               //otherwise you''ll see the alert shortly at the beginning
    }
);

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
        $('#cycleTime').val(cycleTime);
    }

    if(localStorage.getItem("ipAdress") !== null){
       ipAdress = JSON.parse(localStorage.getItem("ipAdress"));
       $("#ipInput").val(ipAdress);
    }

   togglePatternButtons();
   disableSaveButtons();
    window.myLine.update();
};

function togglePatternButtons(){
    if(stop == true){
        $("[data-pattern]").attr('disabled',false);
        $("#walkButton").attr('disabled',false);
        $("#stopButton").attr('disabled',true);
    }
    else
    {
        $("[data-pattern]").attr('disabled',true);
        $("#walkButton").attr('disabled',true);
        $("#stopButton").attr('disabled',false);
    }

}

function enableSaveButtons(){
    var tmpString;
    var saveName;

    // for (key in patterns) {
    //     if (!patterns.hasOwnProperty(key)) continue;
    //
    //
    // }

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


//contol page

$("#walkButton").click(function () {
        stop = false;
        console.log(stop);
        togglePatternButtons();
    $.post("http://192.168.1.122/setPattern", JSON.stringify({stop: stop}), function( data ) {
        console.log(data);
    });
    }
);

$("#stopButton").click(function () {
        stop = 1;
        console.log(stop);
        togglePatternButtons();
    $.post("http://192.168.1.122/setPattern", JSON.stringify({stop: stop}), function( data ) {
        console.log(data);
    });
    }
);


$("[data-pattern]").click(function () {
    var patternId = $(this).attr("data-pattern");
    ipAdress = $("#ipInput").val();
    localStorage.setItem("ipAdress", JSON.stringify(ipAdress));
        $.post("http://" + ipAdress + "/setPattern", JSON.stringify({
            steps: steps,
            cycleTime: cycleTime,
            patterns: patterns["save" + patternId],
            pinNumber: pinNumber,
            countActuators: pinNumber.length
        }), function (data) {
            console.log(data);
            if(data.result == true){
                $("#successAlert").fadeTo(2000, 500).slideUp(500, function(){
                    $("#successAlert").slideUp(500);
                });
            }
        });



    console.log("Click Pattern" + patternId);
});
//Navigating without reloading page

$("[data-nav]").click(function () {
    var pageId = $(this).attr("data-nav");
    console.log("PageID: "+ pageId);
    $("[data-nav]").removeClass("bg-secondary").filter("[data-nav = "+pageId+"]").addClass("bg-secondary");
    $("[data-page]").addClass("d-none").filter("[data-page ="+pageId+"]").removeClass("d-none");
});

//configurations page

$('#actuatorButtons button').click(function() {
    $(this).toggleClass("active");
    var index = $(this).text();
    console.log(index);
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

$("#saveConfigButton").click(function (e) {
    e.preventDefault();
    console.log(stepsInput.val());
    if(stepsInput.val() > maxSteps)
    {
        $("#stepsAlert").removeClass("d-none");
        return;
    }
    else if(stepsInput.val() != "")
    {
        $("#stepsAlert").addClass("d-none");
        steps = stepsInput.val();
        localStorage.setItem("steps",steps);
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
    localStorage.setItem("actuators",JSON.stringify(actuators));
    cycleTime = $("#cycleTime").val();
    if(!($("#cycleTime").val() == "")){
        localStorage.setItem("cycleTime", cycleTime);
    }
    window.myLine.update();

});
//patterns page

$("[data-save]").click(function () {
    saveId = $(this).attr('data-save');
    console.log("SaveID: " + saveId);

    if(saveSelected == false && copySelected == false && clearSelected == false){
        for(var index = 0; index <pinNumber.length; index++){
            config.data.datasets[index].data = [];
            config.data.datasets[index].data = patterns['save'+saveId][index].filter(copyArray);
        }
    }

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

    if(clearSelected == true){

       patterns['save'+saveId] = [];
       localStorage.removeItem("save"+saveId);
       $("#clearButton").trigger("click");
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
    $("#copyButton").trigger("click");
    console.log("CopyID: " + copyId);
});


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

/*
$("#cancelButton").click(function () {
    $("#saveButton, #copyButton, #clearButton").prop("disabled",false);
    saveSelected = false;
    copySelected = false;
    clearSelected = false;
    $("#cancelButton").addClass("d-none");
    disableSaveButtons();
});
*/

//charts.js functions for comparing

var colorNames = Object.keys(window.chartColors);