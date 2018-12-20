var stop = true;                                    //for stopping & setting in motion (robot)
var actuators = [0,0,0,0,0,0,0,0];                  //to see which of the actuator buttons activated
var pinNumber = actuators.map(getPinNumber);        //for the chosen pins
var cycleTime = 0;                                  //time needed for a whole cycle of a pattern
var steps = 8;                                      //steps chosen by the user
var maxSteps= 10;                                   //maximum possuble steps
var patterns = {save1: [], save2: [], save3: []};   //save slots for the patterns
var saveSelected = false;                           // flag for save button on the patterns-tab
var copySelected = false;                           // flag for copy button on the patterns-tab
var clearSelected = false;                          // flag for clear button on the patterns-tab
var saveId = 0;                                     //
var copyId = 0;                                     //
var ipAdress;                                       //for IP-adress of adafruit
var expMode = false;                                //shows if experimental mode is enabled
var colorNames = Object.keys(window.chartColors);   // different colors for the chart

var STEPS = [];                                     //creating labels für the charts; depends on maxSteps
for(var index = 0; index < maxSteps; index++){
    STEPS[index] = index;
}

//configurations for the chart
var config = {
    type: 'line',
    data: {
        labels: ['0', '1', '2', '3', '4', '5', '6'],
        datasets: []
    },
    options: {
        maintainAspectRatio: true,
        elements: {
            line: {
                tension: 0 // disables bezier curves
            }
        },
        dragData: true,
        dragX: false,
        responsive: true,
        title: {
            display: true,
            text: 'Walking patterns'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Step'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Degree'
                },
                ticks: {
                    min: 0,
                    stepSize: 10,
                    max: 180
                }
            }]
        }
    }
};
//*********************************************************************************************************************
//these functions are needed to be loaded before functions.js
//*********************************************************************************************************************
function getPinNumber(value,index,array) {
    if(value == 1){
        return index;
    }
    else{
        return 0;
    }
}

function  reduceArray(value,index,array) {
    return value > 0;
}

function copyArray(value,index,array) {
    return value >= 0;
}
