# Cumulocity package blueprint

This is package blueprint to make scaffolding microfrontends easier for developers.

**How to start**

Run the command below to scaffold an `package-blueprint`.

```
c8ycli new <yourPackageName> package-blueprint
```

Navigate to new package directory and install dependencies

```
npm i
```

As the app.module is a typical Cumulocity application, any new application can be run locally via the CLI:

```
npm run start
```

In order to deploy an application, use `npm run deploy` or build it with `npm run build`, zip application files and upload manually as a package in your tenant Administration application. 

