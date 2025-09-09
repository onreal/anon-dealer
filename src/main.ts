import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue'
import {router} from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from "./i18n"
import VueIndexed from "./persistent/plugin/VueIndexed"
import './assets/css/main.css'

const app = createApp(App)
app.use(VueIndexed, [])
app.use(i18n, [])
app.use(ElementPlus)
app.use(router)

const globals = app.config.globalProperties
// Store globals on window to avoid circular dependency
;(window as any).__VUE_APP_GLOBALS__ = globals

app.mount('#app')

export {app, globals}
