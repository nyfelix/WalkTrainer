#include <Wire.h>
#include <Api.h>
#include <Adafruit_PWMServoDriver.h>
#include <stdio.h>

#define MAX_ACTUATORS 8
#define MAX_STEPS 10

#define SERVOMIN 120 // this is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 800 // this is the 'maximum' pulse length count (out of 4096)

int actuator = 4;
int steps = 4;

double targetPos[MAX_ACTUATORS][MAX_STEPS] = {0};
double currentPos[MAX_ACTUATORS] = {0};
int pinNr[MAX_ACTUATORS] = {0};
int countActuators = 0;
int currentStep = 0;
int stepsDone = 0;
double cycleTime = 1000;
double stepTime = cycleTime / steps;
double startTime;
bool stop = true;

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

void posCalculator(const double mat[MAX_ACTUATORS][MAX_STEPS], const int nrSteps, const int nrActuators, const int usedPins[], const int currStep, double currPos[]);
void callbackPost(JsonObject &content);


void setup()
{
    // put your setup code here, to run once:
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println("Setup Done");

    setupApi();

    cb_request = callbackPost;

    pwm.begin();
    pwm.setPWMFreq(60); // Set to whatever you like, we don't use it in this demo!

    for (int i = 0; i < actuator; i++)
    {
        for (int j = 0; j < steps; j++)
        {
            targetPos[i][j] = map(targetPos[i][j], 0, 180, SERVOMIN, SERVOMAX);
        }
    }
}

void loop()
{
    if (stop == false)
    {
        posCalculator(targetPos, steps, countActuators, pinNr, currentStep, currentPos);

        if ((millis() - startTime) / ((stepsDone + 1) * stepTime) >= 1)
        {
            currentStep++;
            stepsDone++;
            if (currentStep == steps)
            {
                currentStep = 0;
            }
        }
        loopApi();
    }
    else
    {
        loopApi();
        currentStep = 0;
        stepsDone = 0;
        startTime = millis();
    }
}

void posCalculator(const double mat[MAX_ACTUATORS][MAX_STEPS], const int nrSteps, const int nrActuators, const int usedPins[], const int currStep, double currPos[])
{
    for (int index = 0; index < nrActuators; index++)
    {
        if (currStep == (nrSteps - 1))
        {
            currPos[index] = ((mat[index][0] - mat[index][currStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + mat[index][currStep];
            pwm.setPWM(usedPins[index], 0, currPos[index]);
        }
        else
        {
            currPos[index] = ((mat[index][currStep + 1] - mat[index][currStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + mat[index][currStep];
            pwm.setPWM(usedPins[index], 0, currPos[index]);
        }
    }
}

void callbackPost(JsonObject &content)
{
    if (content.containsKey("cycleTime"))
    {
        cycleTime = content["cycleTime"].as<double>();
    }
    if (content.containsKey("stop"))
    {
        stop = content["stop"].as<bool>();
    }

    if (content.containsKey("countActuators"))
    {
        countActuators = content["countActuators"].as<int>();
    }
    if (content.containsKey("pinNumber"))
    {
        JsonArray &pins = content["pinNumber"];
        pins.copyTo(pinNr);
    }

    if (content.containsKey("steps"))
    {
        steps = content["steps"].as<int>();
        stepTime = cycleTime / steps;
    }

    if (content.containsKey("patterns"))
    {
        JsonArray &pat = content["patterns"];
        pat.copyTo(targetPos);
        for (int i = 0; i < countActuators; i++)
        {
            for (int j = 0; j < steps; j++)
            {
                targetPos[i][j] = map(targetPos[i][j], 0, 180, SERVOMIN, SERVOMAX);
            }
        }
    }  
}
