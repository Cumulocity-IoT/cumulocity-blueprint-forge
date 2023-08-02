# Cumulocity package blueprint

Blueprint Forge enables template driven approach of integrating pre-build and market-ready industry solutions
with a seemless user experience. 

![BlueprintForge](assets/blueprint-forge.png)

## Features
* **Integrate ready solutions:** Blueprint Forge allows template driven approach to integrate ready solutions seemlessly.
* **Easy Customizaton:** Provides option to select dashboards and unselect dashboards.
* **Dashboard Catalog:** User can select any pre-designed template for dashboard and ability to install dependent runtime widgets.
* **Installation of plugins and microservice:** Provides option to install plugins and microservices while creating an application.

## Installation

### Install Blueprint Forge

1. Grab the **[Latest Release Zip](https://github.com/SoftwareAG/cumulocity-blueprint-forge/releases)**
2. Go to the **Administration view** in your tenant (/apps/administration)
3. Open the **Ecosystem** section in the navigator and click **Applications**
4. Go to **Packages**
5. Click **Add Package**
6. Drop zip file or select from your system location.
7. Click **Done**

### Incremental Upgrade

1. Grab the **[Latest Release Zip](https://github.com/SoftwareAG/cumulocity-blueprint-forge/releases)**
2. Go to the **Administration view** in your tenant (/apps/administration)
3. Open the **Ecosystem** section in the navigator and click **Applications**
4. Go to **Packages**
5. Click **Add Package**
6. Drop zip file or select from your system location.
7. Click **Done**

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


In order to deploy an application, use `npm run deploy` or build it with `npm run build`, zip application files and upload manually as a package in your tenant Administration application. 

