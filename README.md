# Blueprint Forge for Cumulocity

Blueprint Forge provides a simple, coding-free way to build cumulocity application using pre-built solution templates. Blueprint Forge is an open-source Cumulocity Blueprint that empowers you to initially build an application from a template and later enhance it with additional plugins, dashboards, branding and much more. It's being managed by the Software AG's open-source community but not officially supported by Software AG. You can log any issues at GitHub or ask any question on the Software AG Tech Community. Support will be provided on best endeavours.

[Discover, Learn, Excel: Access How-To Video and Demos at a Glance!](https://open-source.softwareag.com/cumulocity-blueprint-forge)


![BlueprintForge](assets/blueprint-forge.png)

## What's new?

* **Multiple Welcome Templates:** Now user can select Welcome Dashboard while creating application. Choose from a variety of Welcome Templates tailored to your needs.
* **Tailor Your Simulation:** Your Choice or Auto-Magic Based on Dashboard Pick.
* **Link Device from Dashboard:** Link Device with a Click to Another Dashboard.
* **Craft Your Dashboard:** Pick a Template, Fill it with Flair.
* **New Custom Template:** Customize Devices, Choose Template, Go.
* **Seamless DTDL Generation:** Mimic Real Devices, Anywhere, Anytime.
* **Enhanced Dashboard Catalog:** Dashboards at Your Fingertips. Find Your Fit with Ease!
* **Share Dashboards:** Share, Reuse, Shine. Your Custom Dashboards, Everywhere You Go, within Tenant or across Tenants.
* **Various bug fixes**

## Features
* **Solution Templates:** Blueprint Forge support template-driven approach which enable delivery and maintenance of pre-built solution templates with a seamless user experience. As in initial version, we have Field Services, Predictive Maintenance and Demo Template as our pre-built solution templates.
* **Easy Customization:** Simplified customization to configure dashboard, devices, widgets and microservices.
* **Dashboard Catalog:** User can select any pre-designed template for dashboard and ability to install dependent widgets.
* **Installation of plugins and microservice:** Provides option to install plugins and microservices while creating an application.
* **Provision to add essential dashboards:** Effortlessly Craft Applications Using Demo Template's Essential Dashboards and Features – Explore the Overview, Receive a Warm Welcome, Find Help and Support.
* **Blank Template support:** The Blank Template Lets You Build Applications from Scratch, No Dashboards or Plugins Preselected.
* **Support for Device group and Asset Type:** Link not just devices, user can also link Device Group and Asset type with the dashboard.
* **Configure while creating:** User can configure the application while creating it.
* **Custom Branding:** Provides flexibility and control over application’s look and feel. Now user can use color picker to choose millions of colors to customize branding. Header, Action bar and tab bar are also customizable. User can add his own branding by choosing different colors of his choice in the application. 
* **Configure Simulator:** Configure the simulator as desired, or we can also auto-configure based on the selected dashboard template.
* **Link Device from Dashboard:** Map devices from another dashboard by choosing the dashboard to link with.
* **Select Dashboard Template:** Now you can choose a template for your dashboard, it will include all the details from the selected template.
* **New Custom Template:** Add a custom template where you can customize which devices to link and also choose the dashboard template.
* **Generate DTDL:** Generate DTDL files effortlessly based on existing device measurements and simulate real device behavior within the same or different tenants.
* **Enhanced Dashboard Catalog:** Effortlessly find various dashboard templates tailored to your needs.
With intuitive search functionality, selecting the perfect dashboard template has never been easier.
* **Share Dashboards:** Effortlessly share and reuse your customized Dashboards within your own tenant or across different tenants.
Now, easily add your personalized Dashboards to the catalog for seamless access.

## Installation

### Install Blueprint Forge

1. Grab the **[Latest Release Zip](https://github.com/SoftwareAG/cumulocity-blueprint-forge/releases)**
2. Go to the **Administration view** in your tenant (/apps/administration)
3. Open the **Ecosystem** section in the navigator
4. Go to **Extensions**
5. Click **Add Exctension Package**
6. Drop zip file or select from your system location.
7. Click **Done**

### Incremental Upgrade

1. Grab the **[Latest Release Zip](https://github.com/SoftwareAG/cumulocity-blueprint-forge/releases)**
2. Go to the **Administration view** in your tenant (/apps/administration)
3. Open the **Ecosystem** section in the navigator
4. Go to **Extensions**
5. Click **Blueprint Forge**
6. Click "Versions"
7. Drop zip file or select from your system location.
8. Click **Done**

## QuickStart

This guide will teach you how to create your first application using the Blueprint Forge.

**NOTE:** This guide assumes you have followed the [Installation instructions](#Installation)

1. Open the Blueprint Forge package which was installed (refer to Installation step)
2. Click `Deploy application`
3. Enter the application details and click `Save`


You have created an application.

4. Navigate to the application created.
5. Click on Open and you can see the welcome screen.
6. Click on `Start`.
7. You will see the list of templates, click any of the template using which you want to create an application.
8. You will see the details page, click on continue.
9. Select the dashboards, plugins and microservices of you choice.
10. Fill the device details if it is required by the dashboard.
11. You can also fill the configuration for the widgets if needed.
12. Click on `Continue`.
13. It will take a while to install the dependent packages. Then click on `Save and Reload`.

Congratulations! You have successfully created an application using Blueprint Forge with template of your choice.

### User Guide

#### How to upgrade Blueprint Forge application

Blueprint Forge application can be upgraded if new version update is available. If newer update is available, an icon (on hover of it, it shows "Update available") is seen next to the application version below the application name. 

Follow below steps to upgrade your application:

1. Go to Applications -> All applications. 
2. Click on the Blueprint Forge application name which is created. You will be navigated to Application Properties.
3. You will see "Update available" button in the Properties. Click on it.
4. Pop up appears for confirmation. Click on "Update" to upgrade your application.

Congratulations! You have successfully updated your application. You can see the latest version next to your application name.

------------------------------

The Blueprint Forge provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.
_____________________
For more information you can Ask a Question in the [TECH Community Forums](https://tech.forums.softwareag.com/tag/Cumulocity-IoT).

