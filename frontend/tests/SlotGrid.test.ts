import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SlotGrid from '../src/components/SlotGrid.vue';
import type { Slot } from '../src/types';

const slots: Slot[] = [
  { campusId: 'mty', parkingId: 'p1', slotId: '001', label: 'A-001', status: 'available', updatedAt: '' },
  { campusId: 'mty', parkingId: 'p1', slotId: '002', label: 'A-002', status: 'occupied', updatedAt: '' },
];

describe('SlotGrid', () => {
  it('renders one item per slot', () => {
    const wrapper = mount(SlotGrid, { props: { slots } });
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('shows a text status for each slot', () => {
    const wrapper = mount(SlotGrid, { props: { slots } });
    expect(wrapper.find('[data-status="available"]').text()).toContain('Libre');
    expect(wrapper.find('[data-status="occupied"]').text()).toContain('Ocupado');
  });
});
