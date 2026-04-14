import { describe, expect, it } from 'vitest'

import { GatheringsGuards } from '@/api/gatherings/gatherings.guards'

describe('GatheringsGuards', () => {
  it('isStatus：合法狀態', () => {
    expect(GatheringsGuards.isStatus('OPEN')).toBe(true)
    expect(GatheringsGuards.isStatus('UPCOMING')).toBe(true)
    expect(GatheringsGuards.isStatus('CLOSED')).toBe(true)
  })

  it('isStatus：非法字串', () => {
    expect(GatheringsGuards.isStatus('BAD')).toBe(false)
    expect(GatheringsGuards.isStatus('')).toBe(false)
  })

  it('isType：合法類型', () => {
    expect(GatheringsGuards.isType('PARTY')).toBe(true)
    expect(GatheringsGuards.isType('OTHER')).toBe(true)
  })

  it('isType：非法字串', () => {
    expect(GatheringsGuards.isType('INVALID')).toBe(false)
  })
})
