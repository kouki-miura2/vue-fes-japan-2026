import type { ComponentDefinition } from './types.ts'

export const CATALOG: readonly ComponentDefinition[] = [
  {
    id: 'patient',
    name: '患者基本情報',
    short: '患者',
    description: '患者ID・氏名・カナ・性別・生年月日と年齢・病床・体重・注意事項を表示します。',
    width: 1,
    height: 1,
  },
  {
    id: 'obsFull',
    name: '観察項目（バイタルサイン・症状・体重・尿量・飲水量）',
    short: '観察（体重・尿量・飲水量）',
    description:
      '最新バイタルサインと心不全関連の症状・所見、5日間の体重推移と水分出納。目標体重・飲水制限との差を表示。',
    width: 2,
    height: 1,
  },
  {
    id: 'hpi',
    name: '現病歴',
    short: '現病歴',
    description: '主病名、重症度分類（NYHA・TG18・Berlin等）、プロブレムリスト、入院経過の要約。',
    width: 1,
    height: 1,
  },
  {
    id: 'labCardio',
    name: '検査値（心電図・血液）',
    short: '心電図・血液',
    description:
      '12誘導心電図の調律・QRS・QTc、BNP・トロポニン・電解質・腎機能。前回値との比較矢印つき。',
    width: 1,
    height: 1,
  },
  {
    id: 'rx',
    name: '処方・与薬',
    short: '処方・与薬',
    description:
      '定期処方の用法と本日の与薬実施状況。未実施をタップで実施記録。腎機能や相互作用に基づく薬学的注意を表示。',
    width: 2,
    height: 1,
  },
  {
    id: 'dates',
    name: '前回退院日・入院日・退院予定日',
    short: '入退院日',
    description: '在院日数、前回退院からの日数（30日以内再入院の把握）、DPC入院期間の進捗。',
    width: 1,
    height: 1,
  },
  {
    id: 'allergy',
    name: 'アレルギー・禁忌・感染症',
    short: 'アレルギー・禁忌・感染症',
    description: '薬剤・食物アレルギーと反応、禁忌・慎重投与、感染症検査結果と必要な予防策。',
    width: 1,
    height: 2,
  },
  {
    id: 'labHepRenal',
    name: '検査値（肝機能・腎機能・電解質バランス）',
    short: '肝・腎・電解質',
    description:
      '肝・腎・電解質と、CCr・補正Ca・Child-Pughのサンプル評価値を表示。自動計算は行わない。',
    width: 2,
    height: 1,
  },
  {
    id: 'obsVital',
    name: '観察項目（バイタルサイン・症状）',
    short: 'バイタル・症状',
    description: '最新バイタルサインと主要な症状のコンパクト表示。',
    width: 1,
    height: 1,
  },
  {
    id: 'vent',
    name: '人工呼吸器指示',
    short: '人工呼吸器',
    description:
      '換気モードと設定値、実測値（プラトー圧・駆動圧・Vt/IBW・P/F比）を肺保護換気の目標と比較。血液ガス・アラーム設定・指示。',
    width: 1,
    height: 2,
  },
  {
    id: 'infusion',
    name: '注射・輸液指示',
    short: '注射・輸液',
    description:
      'ポンプごとの薬剤・濃度・流量と体重換算の投与量（γ）、残量と終了予定時刻。留置ルートの日数。',
    width: 2,
    height: 1,
  },
  {
    id: 'device',
    name: '医療機器管理',
    short: '医療機器',
    description: '使用中の医療機器と管理番号、使用開始日、定期点検期限。',
    width: 1,
    height: 1,
  },
  {
    id: 'check',
    name: '使用中点検',
    short: '使用中点検',
    description:
      '使用中機器の点検チェックリスト。全項目を確認すると点検完了を記録し、次回予定を更新。',
    width: 1,
    height: 1,
  },
  {
    id: 'discharge',
    name: '退院予定日',
    short: '退院予定',
    description: '退院予定日と残り日数、退院調整の予定。',
    width: 1,
    height: 1,
  },
]
