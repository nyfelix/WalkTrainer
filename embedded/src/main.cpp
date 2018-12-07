#include <Wire.h>
#include <Api.h>
#include <Adafruit_PWMServoDriver.h>
#include <stdio.h>

#define MAX_ACTUATORS 8
#define MAX_STEPS 10

#define SERVOMIN 120 // this is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 750 // this is the 'maximum' pulse length count (out of 4096)

int actuator = 4;
int steps = 4;

//double targetPos[actuator][steps] = {{0, 30, 60, 90,120, 90, 60, 30},{180, 90, 0, 90,90, 180, 90, 0,},{180, 0, 180, 0,90, 180, 90, 0,},{180, 0, 180, 90,90, 180, 90, 0,}};
double targetPos[MAX_ACTUATORS][MAX_STEPS] = {0};
double currentPos[MAX_ACTUATORS] = {0};
int pinNr[MAX_ACTUATORS] = {0}; 
int countActuators = 0; 
int currentStep = 0;
int stepsDone = 0;
double cycleTime = 1000;
double stepTime = cycleTime / steps;
double startTime;
bool quit = true;
//int servos[4] = {0,2,4,6}

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

void posCalculator(int index, int pin);
void posTesting(const double mat[MAX_ACTUATORS][MAX_STEPS], const int nrSteps, const int nrActuators, const int usedPins[], const int currStep, double currPos[]);

void callbackPost(JsonObject &content)
{
    //Serial.println(content["steps"].as<String>());
    //Serial.println(content["cycleTime"].as<double>());
    if (content.containsKey("cycleTime"))
    {
        cycleTime = content["cycleTime"].as<double>();
    }
    if (content.containsKey("stop"))
    {
        quit = content["stop"].as<bool>();
    }
    

    if(content.containsKey("countActuators"))
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
    Serial.println(quit);
}

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

    // if you want to really speed stuff up, you can go into 'fast 400khz I2C' mode
    // some i2c devices dont like this so much so if you're sharing the bus, watch
    // out for this!
    //Wire.setClock(400000);
    for (int i = 0; i < actuator; i++)
    {
        for (int j = 0; j < steps; j++)
        {
            targetPos[i][j] = map(targetPos[i][j], 0, 180, SERVOMIN, SERVOMAX);
        }
    }
    //pwm.setPWM(0, 0, SERVOMIN);
    //pwm.setPWM(2, 0, SERVOMIN);
    //pwm.setPWM(4, 0, SERVOMIN);
    //pwm.setPWM(6, 0, SERVOMIN);
}

void loop()
{
    if (quit == false)
    {
        loopApi();
        Serial.println(stepTime);
        posTesting(targetPos, steps, countActuators, pinNr, currentStep, currentPos);

        if ((millis() - startTime) / ((stepsDone + 1) * stepTime) >= 1)
        {
            currentStep++;
            stepsDone++;
            if (currentStep == steps)
            {
                currentStep = 0;
            }
        }
        Serial.println(currentStep);
    }
    else
    {
        loopApi();
        startTime = millis();
        currentStep = 0; 
        stepsDone = 0; 
    }
}

void posCalculator(int index, int pin)
{
    if (currentStep == (steps - 1))
    {
        if (!(targetPos[index][0] - targetPos[index][currentStep]) == 0)
        {
            currentPos[index] = ((targetPos[index][0] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        }
        pwm.setPWM(pin, 0, currentPos[index]);
    }
    else
    {
        if (!(targetPos[index][currentStep + 1] - targetPos[index][currentStep]) == 0)
        {
            currentPos[index] = ((targetPos[index][currentStep + 1] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        }
        pwm.setPWM(pin, 0, currentPos[index]);
    }
}

void posTesting(const double mat[MAX_ACTUATORS][MAX_STEPS], const int nrSteps, const int nrActuators, const int usedPins[], const int currStep, double currPos[])
{
    for (int index = 0; index < nrActuators; index++)
    {

            if (currStep == (nrSteps - 1))
            {
                if (!(mat[index][0] - mat[index][currStep]) == 0)
                {
                    currPos[index] = ((mat[index][0] - mat[index][currStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currStep];
                }
                pwm.setPWM(usedPins[index], 0, currPos[index]);
            }
            else
            {
                if (!(mat[index][currStep + 1] - mat[index][currStep]) == 0)
                {
                    currPos[index] = ((mat[index][currStep + 1] - mat[index][currStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + mat[index][currStep];
                }
                pwm.setPWM(usedPins[index], 0, currPos[index]);
            }
        
    }
}