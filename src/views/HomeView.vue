<template>
  <div class="home">
    <div class="left-panel">
      <div class="upload-section">
        <div class="upload-controls">
          <label class="btn btn-primary" for="file-upload">Choose Images</label>
          <button v-if="images.length" 
                  class="btn btn-warning" 
                  @click="clearImages">
            Clear All
          </button>
        </div>
        <input id="file-upload" type="file" multiple accept="image/*" @change="onFileChange" hidden />
      </div>
      <div class="preview-section">
        <div v-for="(image, index) in images" 
             :key="index" 
             class="preview-item"
             :class="{ 'dragover': dragoverIndex === index }"
             draggable="true" 
             @dragstart="onDragStart(index)" 
             @dragover.prevent="onDragOver($event, index)"
             @dragleave="onDragLeave"
             @drop="onDrop(index)">
          <img :src="image.url" alt="Preview" class="preview-image" @click="showImage(image.url)" />
          <div class="preview-actions">
            <button class="btn btn-danger" @click="removeImage(index)">Delete</button>
            <button class="btn btn-primary" @click="replaceImage($event, index)">Replace</button>
          </div>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <div class="result-container">
        <div class="horizontal-range">
          <DoubleRangeSlider
            :model-value="[horizontalStart, horizontalEnd]"
            @update:model-value="([start, end]) => { horizontalStart = start; horizontalEnd = end }"
            @change="handleRangeChange"
          />
        </div>
        
        <div class="result-wrapper">
          <div class="result-content">
            <div v-if="isProcessing" class="loading-spinner"></div>
            <template v-else-if="mergedImage">
              <img :src="mergedImage" alt="Result" class="result-preview" @click="previewImage = mergedImage" />
            </template>
          </div>
          
          <div class="vertical-range">
            <DoubleRangeSlider
              vertical
              :model-value="[verticalStart, verticalEnd]"
              @update:model-value="([start, end]) => { verticalStart = start; verticalEnd = end }"
              @change="handleRangeChange"
            />
          </div>
        </div>
        
        <div class="crop-control">
          <label for="crop-percentage">Crop Bottom Percentage:</label>
          <div class="crop-percentage-input">
            <input 
              id="crop-percentage" 
              type="number" 
              v-model.number="cropPercentage" 
              min="5" 
              max="100" 
              @change="handleRangeChange" 
              class="range-number-input"
            />
            <span>%</span>
          </div>
          <input 
            type="range" 
            v-model.number="cropPercentage" 
            min="5" 
            max="100"
            class="range-slider"
            @change="handleRangeChange"
          />
        </div>
        
        <div class="result-actions" v-if="mergedImage">
          <button class="btn btn-primary" @click="downloadImage">Download</button>
        </div>
      </div>
    </div>
    <div v-if="previewImage" class="full-image-modal" @click="previewImage = null">
      <img :src="previewImage" alt="Full Preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/variables.css';
import '@/assets/styles/home.css';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { useImageDrag } from '@/hooks/useImageDrag';
import DoubleRangeSlider from '@/components/DoubleRangeSlider.vue';

const {
  images,
  mergedImage,
  previewImage,
  cropPercentage,
  horizontalStart,
  horizontalEnd,
  verticalStart,
  verticalEnd,
  isValidImageFile,
  processImages,
  downloadImage,
  isProcessing,
  clearImages,
} = useImageProcessing();

const {
  dragoverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
} = useImageDrag(images, async () => {
  // 排序后自动更新结果图片
  if (images.value.length > 0) {
    await processImages();
  }
});

const onFileChange = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    const validFiles = Array.from(files).filter(isValidImageFile);
    
    if (validFiles.length === 0) {
      alert('No valid image files selected.');
      return;
    }

    // Add all valid files
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      images.value.push({ file, url });
    });

    // Process images immediately after adding them
    await processImages();

    // Invalid files warning
    const invalidFiles = Array.from(files).filter(file => !isValidImageFile(file));
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} invalid file(s) were skipped.`);
    }
  }
};

const removeImage = (index: number) => {
  images.value.splice(index, 1);
};

const replaceImage = (event: Event, index: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      if (isValidImageFile(file)) {
        const url = URL.createObjectURL(file);
        images.value.splice(index, 1, { file, url });
      } else {
        alert(`Invalid file type: ${file.name}. Please upload only images.`);
      }
    }
  };
  input.click();
};

const showImage = (url: string) => {
  previewImage.value = url;
};

// 修改 handler 以立即处理图片
const handleRangeChange = async () => {
  if (images.value.length > 0) {
    await processImages();
    // 滚动到结果区域
    const resultSection = document.querySelector('.result-section');
    resultSection?.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* 样式已移至 home.css */
</style>
