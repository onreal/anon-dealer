import { createI18n } from "vue-i18n";

import en from './locales/en.json'
import el from './locales/el.json'

export const defaultLocale = 'en'
export const fallbackLocale = 'el'

export const languages = {
    en: en,
    el: el
}

export const translations = Object.assign(languages)

export default createI18n({
    locale: defaultLocale,
    fallbackLocale: fallbackLocale,
    legacy: false,
    globalInjection: true,
    messages: translations
})
