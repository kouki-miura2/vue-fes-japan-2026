export type Level = '' | 'crit' | 'warn' | 'ok' | 'info'
export type Flag = '' | 'H' | 'L'
export type Vital = [label: string, value: string, unit: string, note: string, level: Level]
export type Symptom = [label: string, value: string, level: Level]
export type LabRow = [label: string, value: string, unit: string, flag: Flag, previous?: string]
export interface ClinicalRecord {
  vt: string
  vit: Vital[]
  sym: Symptom[]
  wt: [date: string, value: number][]
  wtDelta: string
  wtDir: Level
  io: [date: string, input: number, urine: number][]
  hpi: { dx: string; chips: string[]; prob: string[]; text: string }
  ecg: {
    t: string
    rhythm: string
    m: [label: string, value: string, unit: string, level: Level][]
    note: string
  }
  bt: string
  blood: LabRow[]
  rxAlerts: [text: string, level: Level][]
  rx: [drug: string, usage: string, slots: string[]][]
  dates: {
    prev: string
    prevSub: string
    adm: string
    admSub: string
    plan: string
    planSub: string
    dpc: string
    dpcPct: number
    dpcNote: string
    dpcL: Level
  }
  al: {
    known: boolean
    prec: string
    precL: Level
    drug: { n: string; r: string; y?: string }[]
    food: { n: string; r: string; y?: string }[]
    contra: { n: string; r: string }[]
    inf: [label: string, result: string, positive: 0 | 1 | null][]
  }
  lt: string
  hep: LabRow[]
  ren: LabRow[]
  ele: LabRow[]
  der: [label: string, value: string, level: Level][]
  dose: string
  vent: {
    mode: string
    since: string
    ibw: string
    set: [label: string, value: string, unit: string][]
    meas: [label: string, value: string, unit: string, target: string, level: Level][]
    abgT: string
    abg: [label: string, value: string, flag: Flag][]
    alarm: [label: string, value: string][]
    orders: string[]
  } | null
  o2: string
  o2Sub: string
  pumps: [
    id: string,
    drug: string,
    concentration: string,
    rate: string,
    dose: string,
    remaining: number,
    total: number,
    end: string,
    level: Level,
  ][]
  inter: string[]
  lines: [label: string, note: string, level: Level][]
  infNote: string
  dev: [
    name: string,
    id: string,
    since: string,
    deadline: string,
    level: Level,
    dueDate?: string | null,
  ][]
  chk: { target: string; last: string; by: string; next: string; items: string[] }
  dis: { date: string; status: string; l: Level; remain: string; notes: string[] }
}
