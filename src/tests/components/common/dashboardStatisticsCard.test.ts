import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DashboardStatisticsCard from '@/components/common/DashboardStatisticsCard.vue'

describe('DashboardStatisticsCard', () => {
  it('顯示標題與數值', () => {
    const wrapper = mount(DashboardStatisticsCard, {
      props: {
        title: '總數',
        value: 42,
        statTheme: 'users',
      },
    })
    expect(wrapper.text()).toContain('總數')
    expect(wrapper.text()).toContain('42')
  })

  it('載入中且傳入 loadingText 時顯示 loadingText', () => {
    const wrapper = mount(DashboardStatisticsCard, {
      props: {
        title: '載入',
        value: 99,
        statTheme: 'admin',
        isLoading: true,
        loadingText: '…',
      },
    })
    expect(wrapper.text()).toContain('…')
    expect(wrapper.text()).not.toContain('99')
  })

  it('依 statTheme 顯示左側圖示（SVG）', () => {
    const wrapper = mount(DashboardStatisticsCard, {
      props: {
        title: '標籤',
        value: 0,
        statTheme: 'tags',
      },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
