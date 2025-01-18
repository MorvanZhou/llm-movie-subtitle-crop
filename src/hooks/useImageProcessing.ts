import { ref } from 'vue';
import type { ImageFile } from '@/types/image';

export function useImageProcessing() {
  const images = ref<ImageFile[]>([]);
  const mergedImage = ref<string | null>(null);
  const previewImage = ref<string | null>(null);
  const cropPercentage = ref(10);
  const isProcessing = ref(false);

  const isValidImageFile = (file: File) => 
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const cropImage = (img: HTMLImageElement, percentage: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    const cropHeight = img.height * (percentage / 100);
    canvas.width = img.width;
    canvas.height = cropHeight;
    ctx.drawImage(img, 0, img.height - cropHeight, img.width, cropHeight, 0, 0, img.width, cropHeight);
    return canvas;
  };

  const mergeImages = (canvases: (HTMLImageElement | HTMLCanvasElement)[]): string => {
    const firstImage = canvases[0] as HTMLImageElement;
    const totalHeight = firstImage.height + canvases.slice(1).reduce((sum, canvas) => sum + (canvas as HTMLCanvasElement).height, 0);
    const mergedCanvas = document.createElement('canvas');
    const ctx = mergedCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    mergedCanvas.width = firstImage.width;
    mergedCanvas.height = totalHeight;

    let yOffset = 0;
    ctx.drawImage(firstImage, 0, 0);
    yOffset += firstImage.height;
    canvases.slice(1).forEach(canvas => {
      ctx.drawImage(canvas as HTMLCanvasElement, 0, yOffset);
      yOffset += (canvas as HTMLCanvasElement).height;
    });

    return mergedCanvas.toDataURL('image/png');
  };

  const processImages = async () => {
    isProcessing.value = true;
    try {
      const imageElements = await Promise.all(images.value.map(image => loadImage(image.file)));
      const croppedImages = [imageElements[0], ...imageElements.slice(1).map(img => cropImage(img, cropPercentage.value))];
      mergedImage.value = mergeImages(croppedImages);
    } finally {
      isProcessing.value = false;
    }
  };

  const downloadImage = () => {
    if (mergedImage.value) {
      const link = document.createElement('a');
      link.href = mergedImage.value;
      link.download = 'merged-image.png';
      link.click();
    }
  };

  const clearImages = () => {
    images.value = [];
    mergedImage.value = null;
  };

  return {
    images,
    mergedImage,
    previewImage,
    cropPercentage,
    isValidImageFile,
    processImages,
    downloadImage,
    isProcessing,
    clearImages
  };
}
