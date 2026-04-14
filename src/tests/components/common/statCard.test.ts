import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatCard from '@/components/common/StatCard.vue'

describe('StatCard', () => {
  it('顯示標題與數值', () => {
    const wrapper = mount(StatCard, {
      props: {
        title: '總數',
        value: 42,
      },
    })
    expect(wrapper.text()).toContain('總數')
    expect(wrapper.text()).toContain('42')
  })

  it('載入中時顯示 loadingText', () => {
    const wrapper = mount(StatCard, {
      props: {
        title: '載入',
        value: 99,
        isLoading: true,
        loadingText: '…',
      },
    })
    expect(wrapper.text()).toContain('…')
    expect(wrapper.text()).not.toContain('99')
  })
})
