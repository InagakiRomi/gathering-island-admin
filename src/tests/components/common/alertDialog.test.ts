import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AlertDialog from '@/components/common/AlertDialog.vue'

const passthrough = { template: '<div><slot /></div>' }

const alertDialogStubs = {
  AlertDialog: {
    props: ['open'],
    emits: ['update:open'],
    template: '<div v-show="open" data-root="alert"><slot /></div>',
  },
  AlertDialogContent: passthrough,
  AlertDialogHeader: passthrough,
  AlertDialogTitle: { template: '<div class="title"><slot /></div>' },
  AlertDialogDescription: { template: '<div class="desc"><slot /></div>' },
  AlertDialogFooter: passthrough,
  AlertDialogCancel: { template: '<button type="button" class="cancel"><slot /></button>' },
  AlertDialogAction: {
    template: '<button type="button" class="confirm"><slot /></button>',
  },
}

describe('AlertDialog（common）', () => {
  it('error 預設標題與關閉文案', () => {
    const wrapper = mount(AlertDialog, {
      props: { open: true, variant: 'error' },
      global: { stubs: alertDialogStubs },
    })
    expect(wrapper.text()).toContain('發生錯誤')
    expect(wrapper.text()).toContain('關閉')
  })

  it('title／description 可覆寫', () => {
    const wrapper = mount(AlertDialog, {
      props: {
        open: true,
        variant: 'success',
        title: '自訂標題',
        description: '自訂內容',
      },
      global: { stubs: alertDialogStubs },
    })
    expect(wrapper.text()).toContain('自訂標題')
    expect(wrapper.text()).toContain('自訂內容')
  })

  it('confirm 模式顯示確認按鈕並觸發 confirm', async () => {
    const wrapper = mount(AlertDialog, {
      props: {
        open: true,
        variant: 'confirm',
        showConfirm: true,
        confirmText: '確定刪除',
      },
      global: { stubs: alertDialogStubs },
    })

    expect(wrapper.text()).toContain('確定刪除')
    await wrapper.find('.confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })
})
