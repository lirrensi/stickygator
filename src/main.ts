// FUCK THIS INSTEAD IN RAW HTML
// import jQuery from "jquery";
// (window as any).$ = window.jQuery = jQuery;
// // import "jquery-ui";
// import "jquery-ui/ui/core";

import { isPlatform } from "@ionic/vue";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { storeInit } from "./store/store";

import { IonicVue } from "@ionic/vue";

import { overrideCtrlS, mapTouchEvents } from "./util/keyboard";

// CSS declarations

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
import "@ionic/vue/css/palettes/dark.class.css";
// import "@ionic/vue/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

// QUILL styles
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "./theme/quill-styles.css";

import "vue3-colorpicker/style.css";

import "./theme/custom.css";

// APP INITS

const pinia = createPinia();
const app = createApp(App).use(IonicVue).use(router).use(pinia);

router.isReady().then(() => {
    storeInit();
    app.mount("#app");
});

// GLOBAL HANDLERS
overrideCtrlS();
if (isPlatform("mobile")) {
    mapTouchEvents();
}
