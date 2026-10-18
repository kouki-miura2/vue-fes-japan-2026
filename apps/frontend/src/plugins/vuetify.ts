import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './fonts.css'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'medical',
    themes: {
      medical: {
        dark: false,
        colors: {
          primary: '#0E6E66',
          secondary: '#0F3B37',
          background: '#E8ECEA',
          surface: '#FFFFFF',
          'on-surface': '#16201E',
          error: '#B42318',
          warning: '#8A5300',
          success: '#1E6B43',
          info: '#0E5F58',
          low: '#2450A6',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0, class: 'text-none', variant: 'flat', minHeight: 44 },
    VCard: { rounded: 'lg', elevation: 0 },
    VChip: { label: true },
    VAlert: { density: 'compact', variant: 'tonal' },
  },
})
