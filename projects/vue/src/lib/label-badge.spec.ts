import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import LabelBadge from './label-badge.vue';

describe('LabelBadge', () => {
  it('formats the label and applies the accent tone', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        label: 'userProfileName',
        tone: 'accent',
      },
    });

    expect(wrapper.text()).toBe('User Profile Name');
    expect(wrapper.classes()).toContain('label-badge');
    expect(wrapper.classes()).toContain('label-badge--accent');
  });

  it('defaults to the neutral tone', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        label: 'hello_world',
      },
    });

    expect(wrapper.text()).toBe('Hello World');
    expect(wrapper.classes()).toContain('label-badge--neutral');
  });
});
