import { ref } from 'vue';
import type { Ref } from 'vue';
import type { ImageFile } from '@/types/image';

export function useImageDrag(images: Ref<ImageFile[]>, onOrderChange?: () => void) {
  const draggedIndex = ref<number | null>(null);
  const dragoverIndex = ref<number | null>(null);

  const onDragStart = (index: number) => {
    draggedIndex.value = index;
  };

  const onDragOver = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex.value === index) {
      dragoverIndex.value = null;
      return;
    }
    dragoverIndex.value = index;
  };

  const onDragLeave = () => {
    dragoverIndex.value = null;
  };

  const onDrop = (index: number) => {
    if (draggedIndex.value === null || dragoverIndex.value === null) return;
    if (draggedIndex.value === dragoverIndex.value) return;
    
    const item = images.value[draggedIndex.value];
    images.value.splice(draggedIndex.value, 1);
    
    const targetIndex = dragoverIndex.value > draggedIndex.value 
      ? dragoverIndex.value - 1 
      : dragoverIndex.value;
    
    images.value.splice(targetIndex, 0, item);
    draggedIndex.value = null;
    dragoverIndex.value = null;

    // 触发排序后的回调
    if (onOrderChange) {
      onOrderChange();
    }
  };

  return {
    dragoverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
