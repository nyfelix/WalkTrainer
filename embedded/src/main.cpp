#include <Wire.h>
#include <Api.h>
#include <Adafruit_PWMServoDriver.h>
#include <stdio.h>

#define MAX_ACTUATORS 8
#define MAX_STEPS 10

#define actuator 4
#define steps 4

#define SERVOMIN  120 // this is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX  650 // this is the 'maximum' pulse length count (out of 4096)
double targetPos[steps][actuator] = {{90, 180, 90, 0},{180, 90, 0, 90},{180, 0, 180, 0},{180, 0, 180, 90}};
//double targetPos[actuator][steps] = {{0, 30, 60, 90,120, 90, 60, 30},{180, 90, 0, 90,90, 180, 90, 0,},{180, 0, 180, 0,90, 180, 90, 0,},{180, 0, 180, 90,90, 180, 90, 0,}};
double currentPos[actuator] = {0, 0, 0, 0 };
int currentStep = 0;
int stepsDone = 0; 
double cycleTime = 1000;
double stepTime = cycleTime / steps;
double startTime;
//bool posReached[actuator] = {0, 0, 0, 0};
bool quit = 0;
//int servos[4] = {0,2,4,6}

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

void posCalculator(int index, int pin);


void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.setDebugOutput(true);
  Serial.println("Setup Done");

  setupApi();

  pwm.begin();
  pwm.setPWMFreq(60); // Set to whatever you like, we don't use it in this demo!

  // if you want to really speed stuff up, you can go into 'fast 400khz I2C' mode
  // some i2c devices dont like this so much so if you're sharing the bus, watch
  // out for this!
  //Wire.setClock(400000);
  for (int i = 0; i < actuator; i++){
      for (int j= 0; j < steps; j++){
          targetPos[i][j] = map(targetPos[i][j],0,180,SERVOMIN,SERVOMAX);
      }
  }
  pwm.setPWM(0,0,SERVOMIN);
  pwm.setPWM(2,0,SERVOMIN);
  pwm.setPWM(4,0,SERVOMIN);
  pwm.setPWM(6,0,SERVOMIN);
  startTime = millis();
  }

void loop()
{
    loopApi();

    posCalculator(0,0);
    posCalculator(0,2);
    posCalculator(0,4);
    posCalculator(0,6);
    if ((millis() - startTime) / ((stepsDone + 1) * stepTime) >= 1)
    {
        currentStep++;
        stepsDone++;
        if (currentStep == steps)
        {
            currentStep = 0;
        }
    }

   //Serial.println(currentStep);
   Serial.println(WiFi.localIP()); 
}

void posCalculator(int index, int pin)
{
        if (currentStep == (steps - 1))
    {
        if(!(targetPos[index][0] - targetPos[index][currentStep]) ==0)
        {
        currentPos[index] = ((targetPos[index][0] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        }
                pwm.setPWM(pin, 0, currentPos[index]);
        
    }
    else
    {
        if(!(targetPos[index][currentStep + 1] - targetPos[index][currentStep]) ==0){
        currentPos[index] = ((targetPos[index][currentStep + 1] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        }
                pwm.setPWM(pin, 0, currentPos[index]);
          
    }
}