#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <stdio.h>
#include "Parameters.h"
#include "PosCalculator.h"


void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.println("Setup Done");

  pwm.begin();
  pwm.setPWMFreq(100); // Set to whatever you like, we don't use it in this demo!

  // if you want to really speed stuff up, you can go into 'fast 400khz I2C' mode
  // some i2c devices dont like this so much so if you're sharing the bus, watch
  // out for this!
  //Wire.setClock(400000);
  for (int i = 0; i < steps; i++){
      for (int j= 0; j < actuator; j++){
          targetPos[i][j] = map(targetPos[i][j],0,180,SERVOMIN,SERVOMAX);
      }
  }
  pwm.setPWM(1,0,SERVOMIN);
  //delay(100);
  startTime = millis();
  }

void loop()
{
    posCalculator(2, 2);
    if ((millis() - startTime) / ((stepsDone + 1) * stepTime) >= 1)
    {
        currentStep++;
        stepsDone++;
        if (currentStep == steps)
        {
            currentStep = 0;
        }
    }

    //Serial.println(((targetPos[2][0] - targetPos[2][currentStep]) / stepTime) /* * (millis() - startTime - stepsDone * stepTime) + targetPos[2][currentStep]*/);
   // Serial.println(currentPos[2]);

    //Serial.println(millis());
    /*
      for (int i = 0; i < steps; i++){
      for (int j= 0; j < actuator; j++){
          Serial.print(targetPos[i][j]);
          Serial.print(" ");
      }
      Serial.print("\n"); 
  }
  */
}