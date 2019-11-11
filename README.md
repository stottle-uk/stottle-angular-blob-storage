# StottleAngularBlobStorage

Example code used for medium article about [Uploading to blob storage](https://medium.com/@stuarttottle/upload-to-azure-blob-storage-with-angular-8-2ed80dfc6672) and [Comparing React and Angular](https://medium.com/@stuarttottle/comparing-the-same-feature-written-in-react-and-angular-3f6ae04ceef6)

## App Folder Structure

```
app
│   app.component.ts
│
└───azure-storage
    │   * azure-storage.module.ts
    │
    └───components
    │   │   container-list.component.ts
    │   │   input-file.component.ts
    │   │   items-deleted.component.ts
    │   │   items-downloaded.component.ts
    │   │   items-list.component.ts
    │   │   items-uploaded.component.ts
    │   │   selected-container.component.ts
    │
    └───services
    │   │   blob-deletes-view-state.service.ts
    │   │   blob-downloadeds-view-state.service.ts
    │   │   blob-shared-view-state.service.ts
    │   │   blob-storage.service.ts
    │   │   blob-uploades-view-state.service.ts
    │   │   sas-generator.service.ts
    │   │   * token.ts
    │
    └───types
    │   │   azure-storage.d.ts

* Project specific files


```

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
