/*
  This ist the API Plugin.
  Its a prototype for a plugin to the main class of modular.
  The plugin is generic, only the methods handlePOST and handleGET must
  be implemented locally
*/

#ifndef api_h
#define api_h

#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include "WiFiConfig.h"

#define LISTEN_PORT 80
#define FILE_BUF 50
#define RESPONSE_DEFAULT_INVALID "{ \"jsonroc\" : \"2.0\", \"result\" : false }"
#define RESPONSE_DEFAULT_SUCCESS "{ \"jsonroc\" : \"2.0\", \"result\" : true }"

// Set web server port number to 80
WiFiServer server(LISTEN_PORT);

// Declarations for WiFi API
WiFiClient client;

// Declare Functions for API
String handleRequest(String req);
String handlePOST(String url, String content);
String handleGET(String url, String params);
//////////////////////////////////////////////////

std::function<void(JsonObject&)> cb_request; //creating template to use JsonObjects in main.cpp file

void setupApi() {
  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

void printJSONHeaders() {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/json");
  client.println("Access-Control-Allow-Origin: *");
  client.println("");
  }

void loopApi() {
  if (!client) {
    client = server.available();
  }
  else {
    if (client.available()) {
      // read request
      String req = client.readString();
      Serial.println(req);
      //handle Request
      String response = handleRequest(req);
      // send response
      printJSONHeaders();
      client.print(response.c_str());
      client.stop();
    }
  }
}



// General
String handleRequest(String req) {
  Serial.println("New Request: ");
  String method = req.substring(0,req.indexOf("/")-1);
  String fullUrl = req.substring(req.indexOf("/"), req.indexOf("HTTP")-1);
  Serial.println(fullUrl);
  String url = fullUrl.substring(0, fullUrl.indexOf("?"));
  String params = fullUrl.substring(fullUrl.indexOf("?")+1);
  if (method == "POST") {
    Serial.println(req);
    String content = req.substring(req.indexOf("\r\n\r\n"));
    //Serial.println(content);
    return handlePOST(url, content);
  } else {
    // for now, treat all other requests like GET requests
    return handleGET(url, params);
  }
}

// Implementation of API handler
String handlePOST(String url, String content) {
  if (url == "/setPattern") {
    size_t bufferSize = 3*JSON_ARRAY_SIZE(4) + JSON_OBJECT_SIZE(4);
    DynamicJsonBuffer jsonBuffer(bufferSize);
    JsonObject& root = jsonBuffer.parseObject(content);
    if (!root.success()) {
      return RESPONSE_DEFAULT_INVALID;
    }
    cb_request(root);
  }
  return RESPONSE_DEFAULT_SUCCESS;
}

String handleGET(String url, String params) {
  return "";
}

#endif
