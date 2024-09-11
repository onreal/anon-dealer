import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue'
import {router} from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from "./i18n"
import VueIndexed from "./persistent/plugin/VueIndexed"

const app = createApp(App)
app.use(VueIndexed, [])
app.use(i18n, [])
app.use(ElementPlus)
app.use(router)
app.mount('#app')

const globals = app.config.globalProperties
export {app, globals}
