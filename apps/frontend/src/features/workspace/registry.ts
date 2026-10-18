import './widget-content.css'
import { defineAsyncComponent, h, type Component } from 'vue'

import { CATALOG } from './catalog.ts'
import WidgetCard from './components/WidgetCard.vue'
import type { ComponentDefinition } from './types.ts'

const statusCard = (title: string, text: string) => () =>
  h(WidgetCard, { title }, () => h('p', { role: 'status' }, text))
const WidgetLoading = statusCard('読み込み中', '画面部品を読み込んでいます')
const WidgetLoadError = statusCard('表示できません', '画面部品を読み込めませんでした。')

/**
 * Each widget is its own chunk, fetched from the server only when a layout (or the editor's
 * preview) actually renders it, so a user and terminal load just the components their screen uses.
 */
const lazy = (loader: () => Promise<{ default: Component }>) =>
  defineAsyncComponent({
    loader,
    loadingComponent: WidgetLoading,
    errorComponent: WidgetLoadError,
    delay: 200,
  })

const implemented: Record<string, Component> = {
  patient: lazy(() => import('./components/PatientBasic.vue')),
  discharge: lazy(() => import('./components/DischargePlan.vue')),
  dates: lazy(() => import('./components/AdmissionDates.vue')),
  hpi: lazy(() => import('./components/PresentIllness.vue')),
  obsVital: lazy(() => import('./components/ObservationVital.vue')),
  obsFull: lazy(() => import('./components/ObservationFull.vue')),
  allergy: lazy(() => import('./components/AllergyInfection.vue')),
  labCardio: lazy(() => import('./components/LabCardio.vue')),
  labHepRenal: lazy(() => import('./components/LabHepRenal.vue')),
  rx: lazy(() => import('./components/Prescription.vue')),
  vent: lazy(() => import('./components/Ventilator.vue')),
  infusion: lazy(() => import('./components/Infusion.vue')),
  device: lazy(() => import('./components/DeviceManagement.vue')),
  check: lazy(() => import('./components/InUseCheck.vue')),
}
export const COMPONENTS: (ComponentDefinition & { component: Component | null })[] = CATALOG.map(
  (definition) => ({ ...definition, component: implemented[definition.id] || null }),
)
