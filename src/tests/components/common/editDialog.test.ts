import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EditDialog from '@/components/common/EditDialog.vue'
import { componentMountGlobals, createComponentTestPlugins } from '@/tests/support/componentMountUtils'

const selectStubs = {
  Select: { template: '<div><slot /></div>' },
  SelectContent: { template: '<div><slot /></div>' },
  SelectItem: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<div><slot /></div>' },
  SelectValue: { template: '<span />' },
}

const inputStub = {
  props: ['modelValue', 'id', 'type', 'placeholder'],
  emits: ['update:modelValue'],
  template:
    '<input :id="id" :type="type || \'text\'" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

describe('EditDialog', () => {
  it('必填欄位為空時 emit validation-error', async () => {
    const { pinia, router } = createComponentTestPlugins()
    await router.push('/')

    const wrapper = mount(EditDialog, {
      props: {
        open: true,
        title: '編輯',
        fields: [{ key: 'name', label: '名稱', type: 'text', required: true }],
        form: { name: '' },
        isSubmitting: false,
      },
      global: {
        ...componentMountGlobals(),
        plugins: [pinia, router],
        stubs: {
          ...selectStubs,
          Label: { template: '<label><slot /></label>' },
          Input: inputStub,
        },
      },
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('validation-error')).toBeTruthy()
    const payload = wrapper.emitted('validation-error')?.[0]?.[0] as {
      missingFields: string[]
    }
    expect(payload.missingFields).toContain('名稱')
  })

  it('填寫後送出 emit submit 與 payload', async () => {
    const { pinia, router } = createComponentTestPlugins()
    await router.push('/')

    const wrapper = mount(EditDialog, {
      props: {
        open: true,
        title: '編輯',
        fields: [{ key: 'name', label: '名稱', type: 'text', required: true }],
        form: { name: '' },
        isSubmitting: false,
      },
      global: {
        ...componentMountGlobals(),
        plugins: [pinia, router],
        stubs: {
          ...selectStubs,
          Label: { template: '<label><slot /></label>' },
          Input: inputStub,
        },
      },
    })

    await wrapper.get('#edit-dialog-name').setValue('王小明')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('submit')?.[0]).toEqual([{ name: '王小明' }])
  })
})
