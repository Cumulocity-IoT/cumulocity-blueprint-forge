#  Deprecation notice
This tool is not further developed and it might break with upcoming Cumulocity releases. Use it at your own risk.
The repository is archived but feel free to fork & adapt it to your needs in a new repo.

# Blueprint Forge for Cumulocity

Blueprint Forge provides a simple, coding-free way to build cumulocity application using pre-built solution templates. Blueprint Forge is an open-source Cumulocity Blueprint that empowers you to initially build an application from a template and later enhance it with additional plugins, dashboards, branding and much more. It's being managed by Cumulocity's open-source community but not officially supported by Cumulocity GmbH. You can log any issues at GitHub or ask any question on the Cumulocity AG Tech Community. Support will be provided on best endeavours.

[Discover, Learn, Excel: Access How-To Video and Demos at a Glance!](https://cumulocity-iot.github.io/cumulocity-blueprint-forge/)


![BlueprintForge](assets/blueprint-forge.png)

## What's new?

* **Multiple Welcome Templates:** Now user can select Welcome Dashboard while creating application. Choose from a variety of Welcome Templates tailored to your needs.
* **Tailor Your Simulation:** Select the Dashboard template to create simulator or use our pre-configured one.
* **Link Device from Dashboard:** Link Device with a Click to Another Dashboard.
* **Configure Your Dashboard:** Configure your dashboard by assigning Actual Device or Simulating it.
* **Add Custom Dashboard:** Now user can select pre-built templates for custom dashboards.
* **Enhanced Dashboard Catalog:** Users can now select and filter dashboard templates, as well as create simulators directly from the Dashboard Catalog.
* **Share Dashboards:** Share and Reuse. Add your Custom Dashboards to the Catalog by using "Add to Catalog" button and Share it within Tenant or export and use it in other tenants.
* **DTDL Generator Plugin:** New DTDL plugin to generate DTDL or simulator configuration files based on existing device and measurements.
* **Dashboard Template Preview:** Now user can see the preview of various Dashboard Templates while creating the application.
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
* **Add Custom Dashboard:** Add a custom dashboard where you can customize which devices to link and also choose the dashboard template.
* **Generate DTDL:** Generate DTDL file or Simulator configuration file effortlessly based on existing device measurements and simulate real device behaviour within the same or different tenants. For more information about DTDL Generator. Refer [DTDL Generation](docs/DTDL_Generator/README.md)
* **Enhanced Dashboard Catalog:** Effortlessly find various dashboard templates tailored to your needs. With intuitive search functionality, selecting the perfect dashboard template has never been easier. You can now also create simulator directly from Dashboard Catalog.
* **Share Dashboards:** Effortlessly share and reuse your customized Dashboards within your own tenant or across different tenants. Now, easily add your personalized Dashboards to the catalog for seamless access using "Add to Catalog". 

## Installation

### Install Blueprint Forge

1. Grab the **[Latest Release Zip](https://github.com/Cumulocity-IoT/cumulocity-blueprint-forge/releases)**
2. Go to the **Administration view** in your tenant (/apps/administration)
3. Open the **Ecosystem** section in the navigator
4. Go to **Extensions**
5. Click **Add Exctension Package**
6. Drop zip file or select from your system location.
7. Click **Done**

### Incremental Upgrade

1. Grab the **[Latest Release Zip](https://github.com/Cumulocity-IoT/cumulocity-blueprint-forge/releases)**
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

#### How to create Blueprint Forge application

Blueprint Forge provides various options and flexibility while you create your application. You can configure your device, simulate it or also link device of another dashboard.

1. Go to Extensions -> Click Blueprint Forge.
2. Click on Deploy application. Edit application name and other details if required.
3. Click on Open and open the created application.
4. Click on Start -> Choose the template and click on Continue.
5. You will be navigated to Details step. Click on continue.
6. In this step you can choose Welcome template from various templates available and can edit the Application Configuration.
7. Click on Continue.
8. In the Connect step, you can configure Devices/Simulators/link your dashboard with another. You can also proceed with default configuration.
9. In case of Device:
   - Click on Device icon and select Device/Group/Type.
   - Select the dashboard template of your choice.
10. In case of simulator:
    - Click on Simulator icon and fill the Group name and Number of devices field.
    - Select the Dashboard template of your choice.
11. In case of Link Dashboard:
    - Click on Link icon.
    - Select the Dashboard (the dashboard will have same device of link dashboard which you choose) and select the Dashboard template of your choice.
12. You can also proceed with default configuration provided within this step.
13. Click on Continue. All the necessary plugins/microservices and other dependencies will be installed required for the dashboards.
14. Click on Save and reload.

Congratulations! You have successfully created an application using Blueprint Forge with template of your choice.

For more details, please visit our [Step-by-Step How-To Video Guide](https://cumulocity-iot.github.io/cumulocity-blueprint-forge/).



------------------------------

This blueprint forge is provided as-is and without warranty or support. They do not constitute part of the Cumulocity product suite. Users are free to use, fork and modify them, subject to the license agreement. While Cumulocity GmbH welcomes contributions, we cannot guarantee to include every contribution in the master project.
_____________________
For more information you can ask a question in the [Tech Community Forums](https://techcommunity.cumulocity.com).

