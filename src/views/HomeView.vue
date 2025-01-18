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
      <div class="control-section">
        <div class="crop-control">
          <label for="crop-percentage">Crop Percentage:</label>
          <input id="crop-percentage" type="number" v-model.number="cropPercentage" min="5" max="100" />%
        </div>
        <button v-if="images.length" class="btn btn-success" @click="processImages">Start</button>
      </div>
      <div class="result-section">
        <div v-if="isProcessing" class="loading-spinner"></div>
        <template v-else-if="mergedImage">
          <img :src="mergedImage" alt="Result" class="small-preview" @click="previewImage = mergedImage" />
          <button class="btn btn-primary" @click="downloadImage">Download</button>
        </template>
      </div>
    </div>
    <div v-if="previewImage" class="full-image-modal" @click="previewImage = null">
      <img :src="previewImage" alt="Full Preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/home.css';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { useImageDrag } from '@/hooks/useImageDrag';

const {
  images,
  mergedImage,
  previewImage,
  cropPercentage,
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
} = useImageDrag(images);

const onFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    Array.from(files).forEach(file => {
      if (isValidImageFile(file)) {
        const url = URL.createObjectURL(file);
        images.value.push({ file, url });
      } else {
        alert(`Invalid file type: ${file.name}. Please upload only images.`);
      }
    });
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
</script>
