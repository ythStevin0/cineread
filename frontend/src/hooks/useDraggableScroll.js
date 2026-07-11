import { useRef, useState } from 'react';

/**
 * Hook kustom untuk memberikan fitur "Drag to Scroll" pada elemen yang bisa di-scroll horizontal.
 * 
 * Penggunaan:
 * const { ref, events } = useDraggableScroll();
 * <div ref={ref} {...events} className="overflow-x-auto"> ... </div>
 */
export const useDraggableScroll = () => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault(); // Mencegah pemilihan teks secara tidak sengaja
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2; // Kecepatan scroll (dikali 2 agar lebih responsif)
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return {
    ref,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
    isDragging
  };
};

export default useDraggableScroll;
