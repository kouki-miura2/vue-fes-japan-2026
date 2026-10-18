import './widget-content.css'
import type { Component } from 'vue'

import { CATALOG } from './catalog.ts'
import AdmissionDates from './components/AdmissionDates.vue'
import AllergyInfection from './components/AllergyInfection.vue'
import DeviceManagement from './components/DeviceManagement.vue'
import DischargePlan from './components/DischargePlan.vue'
import Infusion from './components/Infusion.vue'
import InUseCheck from './components/InUseCheck.vue'
import LabCardio from './components/LabCardio.vue'
import LabHepRenal from './components/LabHepRenal.vue'
import ObservationFull from './components/ObservationFull.vue'
import ObservationVital from './components/ObservationVital.vue'
import PatientBasic from './components/PatientBasic.vue'
import Prescription from './components/Prescription.vue'
import PresentIllness from './components/PresentIllness.vue'
import Ventilator from './components/Ventilator.vue'
import type { ComponentDefinition } from './types.ts'

const implemented: Record<string, Component> = {
  patient: PatientBasic,
  discharge: DischargePlan,
  dates: AdmissionDates,
  hpi: PresentIllness,
  obsVital: ObservationVital,
  obsFull: ObservationFull,
  allergy: AllergyInfection,
  labCardio: LabCardio,
  labHepRenal: LabHepRenal,
  rx: Prescription,
  vent: Ventilator,
  infusion: Infusion,
  device: DeviceManagement,
  check: InUseCheck,
}
export const COMPONENTS: (ComponentDefinition & { component: Component | null })[] = CATALOG.map(
  (definition) => ({ ...definition, component: implemented[definition.id] || null }),
)
