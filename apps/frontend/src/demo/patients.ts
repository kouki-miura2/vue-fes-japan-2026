import { PATIENTS } from './fixtures.ts'
import { applyDemoRecords } from './records.ts'
import type { Patient, PatientScenario } from './types.ts'

export const getDemoPatient = async (
  patientId: string | null,
  scenario: PatientScenario,
  signal: AbortSignal,
): Promise<Patient | null> => {
  signal.throwIfAborted()
  if (scenario === 'loading') {
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    })
  }
  if (scenario === 'error') throw new Error('患者情報を取得できませんでした（デモ）')
  if (scenario === 'empty' || !patientId) return null
  const source = PATIENTS.find((patient) => patient.id === patientId)
  if (!source) return null
  const patient = structuredClone(source)
  applyDemoRecords(patient)
  if (scenario === 'missing') {
    return {
      ...patient,
      clinical: null,
      name: null,
      kana: null,
      sex: null,
      birthDate: null,
      bed: null,
      weightKg: null,
      tags: [],
    }
  }
  if (scenario === 'sparse' && patient.clinical) {
    Object.assign(patient.clinical, {
      wt: [],
      io: [],
      vit: [],
      sym: [],
      blood: [],
      hep: [],
      ren: [],
      ele: [],
      der: [],
      rx: [],
      rxAlerts: [],
      pumps: [],
      inter: [],
      lines: [],
      dev: [],
      hpi: { dx: '', chips: [], prob: [], text: '' },
      al: { known: false, prec: '情報未取得', precL: '', drug: [], food: [], contra: [], inf: [] },
      chk: { target: '', last: '', by: '', next: '', items: [] },
    })
  }
  if (scenario === 'long') {
    if (patient.clinical?.dev[0]) {
      patient.clinical.dev[0][3] = '点検期限切れのサンプル 2026/10/01'
      patient.clinical.dev[0][5] = '2026/10/01'
    }
    patient.name = '山田 アレクサンダー 正雄 サンプル患者'
    if (patient.clinical) {
      patient.clinical.hpi.text = patient.clinical.hpi.text.repeat(4)
      patient.clinical.hpi.prob.push(
        '長いプロブレム名・経過情報が折り返されて全文を確認できる表示のデモ',
      )
    }
    patient.kana = 'ヤマダ アレクサンダー マサオ サンプルカンジャ'
    patient.tags = [
      {
        label: '長い注意事項があっても全文を確認できることを確認するためのデモ表示',
        level: 'warning',
      },
      ...patient.tags,
    ]
  }
  return patient
}
