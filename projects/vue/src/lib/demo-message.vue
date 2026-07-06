<script setup lang="ts">
import { computed } from 'vue';

import { formatLabel } from './format-label';

const props = defineProps<{
  label: string;
}>();

const displayLabel = computed(() => formatLabel(props.label));
</script>

<template>
  <p class="demo-message">
    {{ displayLabel }}
  </p>
</template>
