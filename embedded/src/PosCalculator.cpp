#include "PosCalculator.h"
#include "Parameters.h"
//#include <Adafruit_PWMServoDriver.h>

void posCalculator(int index, int pin)
{
        if (currentStep == (steps - 1))
    {
        if(!(targetPos[index][0] - targetPos[index][currentStep]) ==0)
        {
        currentPos[index] = ((targetPos[index][0] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        //delay(50);
        }
                pwm.setPWM(pin, 0, currentPos[index]);
        
    }
    else
    {
        if(!(targetPos[index][currentStep + 1] - targetPos[index][currentStep]) ==0){
        currentPos[index] = ((targetPos[index][currentStep + 1] - targetPos[index][currentStep]) / stepTime) * (millis() - startTime - stepsDone * stepTime) + targetPos[index][currentStep];
        //delay(50);
        }
                pwm.setPWM(pin, 0, currentPos[index]);
          
    }
}