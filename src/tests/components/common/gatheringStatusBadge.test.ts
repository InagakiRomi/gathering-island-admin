import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'

describe('GatheringStatusBadge', () => {
  it('OPEN 顯示報名中', () => {
    const wrapper = mount(GatheringStatusBadge, {
      props: { status: 'OPEN' },
    })
    expect(wrapper.text()).toContain('報名中')
  })

  it('未知狀態顯示預設 dash', () => {
    const wrapper = mount(GatheringStatusBadge, {
      props: { status: 'UNKNOWN' },
    })
    expect(wrapper.text()).toContain('-')
  })
})
