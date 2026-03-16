import {
  createGatheringStatusOptions,
  createGatheringTypeOptions,
  GATHERING_STATUS_TEXT_MAP,
  GATHERING_TYPE_TEXT_MAP,
} from './gatherings.text'
import { TABLE_COMMON_TEXT } from '@/lib/tableText'

export const GATHERING_LIST_TEXT = {
  title: '活動列表',
  subtitle: '管理並檢視目前所有活動資料',
  labels: {
    search: '關鍵字',
    status: '狀態',
    type: '類型',
  },
  placeholders: {
    search: '輸入活動標題或描述',
  },
  actions: {
    search: '搜尋',
    prevPage: TABLE_COMMON_TEXT.actions.prevPage,
    nextPage: TABLE_COMMON_TEXT.actions.nextPage,
  },
  options: {
    all: '全部',
  },
  table: {
    id: 'ID',
    title: '標題',
    type: '類型',
    status: '狀態',
    location: '地點',
    startTime: '活動時間',
    deadline: '截止時間',
    participantNumbers: '名額',
    price: '費用',
  },
  states: {
    loading: TABLE_COMMON_TEXT.states.loading,
    empty: '查無活動資料',
    error: '讀取活動列表失敗，請稍後再試。',
  },
  pagination: TABLE_COMMON_TEXT.pagination,
} as const

export { GATHERING_STATUS_TEXT_MAP, GATHERING_TYPE_TEXT_MAP }

export const GATHERING_STATUS_OPTIONS = createGatheringStatusOptions(GATHERING_LIST_TEXT.options.all)

export const GATHERING_TYPE_OPTIONS = createGatheringTypeOptions(GATHERING_LIST_TEXT.options.all)
