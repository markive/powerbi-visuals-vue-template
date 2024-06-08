"use strict";

//import "../style/visual.scss";
import "./style/vuetify-styles.scss";
import "core-js/stable";
import powerbiVisualsApi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataView = powerbiVisualsApi.DataView;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import { createApp } from "vue";

import Count from './Count.vue';
import vuetify from './vuetify'; // Import the Vuetify plugin

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        if (document) {
            const vueApp = createApp(Count);
            vueApp.use(vuetify); // Use Vuetify
            vueApp.mount(this.target);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}