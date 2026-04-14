import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DangerActionPanel from '@/components/common/DangerActionPanel.vue'
import { componentMountGlobals, createComponentTestPlugins } from '@/tests/support/componentMountUtils'

describe('DangerActionPanel', () => {
  it('顯示標題、描述並在點擊後觸發 action', async () => {
    const { pinia, router } = createComponentTestPlugins()
    await router.push('/')

    const wrapper = mount(DangerActionPanel, {
      props: {
        title: '刪除帳號',
        description: '此操作無法復原。',
        actionLabel: '立即刪除',
      },
      global: {
        ...componentMountGlobals(),
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('刪除帳號')
    expect(wrapper.text()).toContain('此操作無法復原')
    expect(wrapper.text()).toContain('立即刪除')

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
  })

  it('actionDisabled 時按鈕為 disabled', () => {
    const { pinia, router } = createComponentTestPlugins()

    const wrapper = mount(DangerActionPanel, {
      props: {
        description: 'd',
        actionLabel: '執行',
        actionDisabled: true,
      },
      global: {
        ...componentMountGlobals(),
        plugins: [pinia, router],
      },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
