<template>
  <div class="double-range-slider" :class="{ vertical }">
    <div class="slider-container">
      <div class="slider-track"></div>
      <div 
        class="slider-range" 
        :style="vertical 
          ? { 
              bottom: modelValue[0] + '%', 
              height: (modelValue[1] - modelValue[0]) + '%',
              top: 'auto'
            }
          : { 
              left: modelValue[0] + '%', 
              width: (modelValue[1] - modelValue[0]) + '%' 
            }">
      </div>
      <input 
        type="range" 
        class="min-slider"
        :value="vertical ? modelValue[0] : modelValue[0]"
        @input="updateMin"
        @mouseup="onSliderRelease"
        min="0" 
        max="100"
        :style="{ zIndex: isDraggingMin ? 2 : 1 }"
        @mousedown="isDraggingMin = true"
      />
      <input 
        type="range" 
        class="max-slider"
        :value="vertical ? modelValue[1] : modelValue[1]"
        @input="updateMax"
        @mouseup="onSliderRelease"
        min="0" 
        max="100"
        :style="{ zIndex: isDraggingMax ? 2 : 1 }"
        @mousedown="isDraggingMax = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import '@/assets/styles/components/doubleRangeSlider.css';

const props = defineProps<{
  modelValue: [number, number],
  vertical?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number, number]): void,
  (e: 'change'): void
}>();

const isDraggingMin = ref(false);
const isDraggingMax = ref(false);

const onSliderRelease = () => {
  isDraggingMin.value = false;
  isDraggingMax.value = false;
  // 确保在滑块释放时触发 change 事件
  emit('change');
};

const updateMin = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (props.vertical) {
    if (value < props.modelValue[1]) {
      emit('update:modelValue', [value, props.modelValue[1]]);
    }
  } else {
    if (value < props.modelValue[1]) {
      emit('update:modelValue', [value, props.modelValue[1]]);
    }
  }
};

const updateMax = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (props.vertical) {
    if (value > props.modelValue[0]) {
      emit('update:modelValue', [props.modelValue[0], value]);
    }
  } else {
    if (value > props.modelValue[0]) {
      emit('update:modelValue', [props.modelValue[0], value]);
    }
  }
};
</script>

<style scoped>
/* 样式已移至 doubleRangeSlider.css */
</style>
