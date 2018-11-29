var walking = false;
var actuators = [0,0,0,0,0,0,0,0];
var pinNumber = actuators.map(getPinNumber);
var cycleTime = 0;
var steps = 8;
var maxSteps= 10;
var patterns = {save1: [], save2: [], save3: []};
var saveSelected = false;
var copySelected = false;
var clearSelected = false;
var saveId = 0;
var copyId = 0;
var stepsInput = $("#stepsInput");
var numberPages = 3;

var STEPS = [];
for(var index = 0; index < maxSteps; index++){
    STEPS[index] = index;
}

var config = {
    type: 'line',
    data: {
        labels: ['0', '1', '2', '3', '4', '5', '6'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: window.chartColors.red,
            borderColor: window.chartColors.red,
            data: [],
            fill: false
        }, {
            label: 'My Second dataset',
            fill: false,
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            data: []
        }]
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
            text: 'Walkingpatterns'
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