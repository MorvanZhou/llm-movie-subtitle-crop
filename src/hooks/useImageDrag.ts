import { ref } from 'vue';
import type { Ref } from 'vue';
import type { ImageFile } from '@/types/image';

export function useImageDrag(images: Ref<ImageFile[]>) {
  const draggedIndex = ref<number | null>(null);
  const dragoverIndex = ref<number | null>(null);

  const onDragStart = (index: number) => {
    draggedIndex.value = index;
  };

  const onDragOver = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (index !== draggedIndex.value) {
      dragoverIndex.value = index;
    }
  };

  const onDragLeave = () => {
    dragoverIndex.value = null;
  };

  const onDrop = (index: number) => {
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      const draggedItem = images.value.splice(draggedIndex.value, 1)[0];
      images.value.splice(index, 0, draggedItem);
    }
    draggedIndex.value = null;
    dragoverIndex.value = null;
  };

  return {
    dragoverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop
  };
}
