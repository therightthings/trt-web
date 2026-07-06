<script setup lang="ts">
import { computed } from 'vue';

import { formatLabel } from './format-label';

const props = withDefaults(
  defineProps<{
    label: string;
    tone?: 'neutral' | 'accent';
  }>(),
  {
    tone: 'neutral',
  },
);

const displayLabel = computed(() => formatLabel(props.label));
const classes = computed(() => ['label-badge', `label-badge--${props.tone}`]);
</script>

<template>
  <span :class="classes">{{ displayLabel }}</span>
</template>
