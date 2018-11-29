#ifndef PARAMETERS_H_
#define PARAMETERS_H_

#include <Adafruit_PWMServoDriver.h>

#define MAX_ACTUATORS 8
#define MAX_STEPS 10

#define actuator 4
#define steps 4

#define SERVOMIN  150 // this is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX  800 // this is the 'maximum' pulse length count (out of 4096)

double targetPos[steps][actuator] = {{90, 180, 90, 0},{180, 90, 0, 90},{90, 0, 180, 0},{180, 0, 180, 90}};
double currentPos[actuator] = {0, 0, 0, 0 };
int currentStep = 0;
int stepsDone = 0; 
double cycleTime = 5000;
double stepTime = cycleTime / (double)steps;
double startTime;
bool posReached[actuator] = {0, 0, 0, 0};
bool quit = 0;

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#endif 