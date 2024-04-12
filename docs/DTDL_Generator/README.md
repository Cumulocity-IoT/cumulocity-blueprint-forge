# Cumulocity Device DTDL Generator Plugin [<img width="35" src="https://user-images.githubusercontent.com/32765455/211497905-561e9197-18b9-43d5-a023-071d3635f4eb.png"/>](https://github.com/SoftwareAG/cumulocity-smart-echart-widget-plugin/releases/download/1.0.2/sag-ps-pkg-smart-echart-1.0.2.zip)

The Device DTDL Generator Plugin is the Cumulocity module federation plugin created using c8ycli. This plugin can be used in any cumulocity application except Administration.
The Device DTDL Generator Plugin generates DTDL for a device.

### Please choose Device DTDL Generator plugin release based on Cumulocity/Application builder version:

| &nbsp;CUMULOCITY&nbsp; | &nbsp;Device DTDL Generator Plugin &nbsp; |
|------------|-----------------------------|
| >= 1018.x.x| 1.x.x                       |

<kbd>![DTDL plugin Image](assets/dtdlWidget.png)</kbd>

## Features

*  **Copy to clipboard:** The dtdl generated can be copied to clipboard with click of a button.

*  **Save to File Repository:** The dtdl generated can be saved to tenant's File Repository.

*  **Download:** The dtdl generated can be downloaded as a json file.

## Prerequisite
   Cumulocity c8ycli >=1018.x.x
   
## Installation

### Runtime plugin Deployment?

* This plugin support runtime deployment. Download [Runtime Binary](https://github.com/SoftwareAG/cumulocity-smart-echart-widget-plugin/releases/download/1.0.2/sag-ps-pkg-smart-echart-1.0.2.zip) and install via Administrations --> Ecosystems --> Extensions.

* Look for `Device DTDL Generator` and install it in your choice of application.

## QuickStart

This guide will teach you how to access DTDL generator plugin in your existing application.

1. Open your application where you have installed the plugin

2. Expand `Configuration` tab from the left navigation bar

3. Click `DTDL Generator`

Congratulations! Enjoy generating DTDL for your device.

## User Guide

-   **Device:** Start typing device name and select the device from typeahead list.

<kbd>![Select Device Image](assets/selectDevice.png)</kbd>

-   Click on 'Generate DTDL' button to generate dtdl for the selected device.

<kbd>![DTDL plugin Image](assets/dtdlWidget.png)</kbd>

-   **Copy to clipboard:** This button will copy the dtdl generated to your clipboard.

-   **Save to File Repository:** This will save a json file with the dtdl generated to your File Repository.

-   **Download:** This will download a json file with the dtdl generated to your local downloads.

------------------------------

This plugin is provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.
_____________________
For more information you can Ask a Question in the [TECH Community Forums](https://tech.forums.softwareag.com/tag/Cumulocity-IoT).
