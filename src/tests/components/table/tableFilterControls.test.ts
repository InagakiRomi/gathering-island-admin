import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TableFilterControls from '@/components/table/TableFilterControls.vue'

const selectStubs = {
  Select: { template: '<div class="select-stub"><slot /></div>' },
  SelectContent: { template: '<div><slot /></div>' },
  SelectItem: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<div><slot /></div>' },
  SelectValue: { template: '<span />' },
}

const inputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input class="search-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

describe('TableFilterControls', () => {
  const baseProps = {
    searchValue: '',
    searchLabel: '關鍵字',
    searchPlaceholder: '請輸入',
    searchButtonText: '搜尋',
    filters: [] as { key: string; label: string; value: string; options: { value: string; label: string }[] }[],
  }

  it('輸入變更時 emit update:searchValue', async () => {
    const wrapper = mount(TableFilterControls, {
      props: baseProps,
      global: {
        stubs: {
          ...selectStubs,
          Input: inputStub,
        },
      },
    })

    const input = wrapper.get('.search-input')
    await input.setValue('abc')
    expect(wrapper.emitted('update:searchValue')?.[0]).toEqual(['abc'])
  })

  it('按下搜尋按鈕 emit search', async () => {
    const wrapper = mount(TableFilterControls, {
      props: baseProps,
      global: {
        stubs: {
          ...selectStubs,
          Input: inputStub,
        },
      },
    })

    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('search')).toBeTruthy()
  })
})
