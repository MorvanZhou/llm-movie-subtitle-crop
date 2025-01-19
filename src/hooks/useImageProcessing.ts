import { ref } from 'vue';
import type { ImageFile } from '@/types/image';

export function useImageProcessing() {
  const images = ref<ImageFile[]>([]);
  const mergedImage = ref<string | null>(null);
  const previewImage = ref<string | null>(null);
  const cropPercentage = ref(10);
  const horizontalStart = ref(0);
  const horizontalEnd = ref(100);
  const verticalStart = ref(0);
  const verticalEnd = ref(100);
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

  const cropImageByRange = (img: HTMLImageElement, hStart: number, hEnd: number, vStart: number, vEnd: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const sourceWidth = img.width * ((hEnd - hStart) / 100);
    const sourceHeight = img.height * ((vEnd - vStart) / 100);
    const sourceX = img.width * (hStart / 100);
    const sourceY = img.height * (vStart / 100);

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    ctx.drawImage(
      img,
      sourceX,
      img.height - sourceY - sourceHeight,  // Start from bottom
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );
    
    return canvas;
  };

  const cropImageByPercentage = (canvas: HTMLCanvasElement, percentage: number): HTMLCanvasElement => {
    const resultCanvas = document.createElement('canvas');
    const ctx = resultCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const cropHeight = canvas.height * (percentage / 100);
    resultCanvas.width = canvas.width;
    resultCanvas.height = cropHeight;

    ctx.drawImage(
      canvas,
      0,
      canvas.height - cropHeight,
      canvas.width,
      cropHeight,
      0,
      0,
      canvas.width,
      cropHeight
    );

    return resultCanvas;
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
      
      // 第一步：根据横向和纵向范围裁剪
      const rangeImages = imageElements.map(img => 
        cropImageByRange(
          img,
          horizontalStart.value,
          horizontalEnd.value,
          verticalStart.value,
          verticalEnd.value,
        )
      );

      // 第二步：对第一张以外的图片进行 percentage 裁剪
      const croppedImages = [
        rangeImages[0],
        ...rangeImages.slice(1).map(img => 
          cropImageByPercentage(img, cropPercentage.value)
        )
      ];

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
    horizontalStart,
    horizontalEnd,
    verticalStart,
    verticalEnd,
    isValidImageFile,
    processImages,
    downloadImage,
    isProcessing,
    clearImages
  };
}
