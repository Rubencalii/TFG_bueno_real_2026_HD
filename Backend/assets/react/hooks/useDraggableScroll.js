import { useRef, useState, useCallback } from "react";

export default function useDraggableScroll() {
    const ref = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = useCallback((e) => {
        if (!ref.current) return;
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
        ref.current.style.cursor = "grabbing";
        ref.current.style.userSelect = "none";
    }, []);

    const onMouseLeave = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        if (ref.current) {
            ref.current.style.cursor = "grab";
            ref.current.style.removeProperty("user-select");
        }
    }, [isDragging]);

    const onMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        if (ref.current) {
            ref.current.style.cursor = "grab";
            ref.current.style.removeProperty("user-select");
        }
    }, [isDragging]);

    const onMouseMove = useCallback(
        (e) => {
            if (!isDragging || !ref.current) return;
            e.preventDefault();
            const x = e.pageX - ref.current.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast multiplier
            ref.current.scrollLeft = scrollLeft - walk;
        },
        [isDragging, startX, scrollLeft],
    );

    // Helper to distinguish between a drag and a click
    // We can check if isDragging is true on mouse up, but for simple scroll
    // usually the click event fires after mouseup. Ideally, we prevent click if moved significantly.
    // For now, let's keep it simple. If we need to block clicks during drag, we can add more logic.

    return {
        ref,
        events: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
            style: { cursor: "grab", overflowX: "auto" }, // Base styles
        },
    };
}
