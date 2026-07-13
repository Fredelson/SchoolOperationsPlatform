import { useEffect, useRef, useState } from "react";

const resolveFontSize = (element, value, fallback) => {
  if (Number.isFinite(Number(value))) {
    return Number(value);
  }

  if (!value) {
    return Number(fallback);
  }

  const previous = element.style.fontSize;
  element.style.fontSize = String(value);
  const resolved = Number.parseFloat(window.getComputedStyle(element).fontSize);
  element.style.fontSize = previous;

  return Number.isFinite(resolved) ? resolved : Number(fallback);
};

export default function AutoFitText({
  children,
  max = 32,
  min = 7,
  lines = 2,
  className = "",
  as: Component = "div",
  style = {},
  title,
}) {
  const ref = useRef(null);
  const [fontSize, setFontSize] = useState(max);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let frame = 0;

    const fit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!element) return;

        let nextSize = resolveFontSize(element, max, 32);
        const minimum = resolveFontSize(element, min, 7);

        element.style.fontSize = `${nextSize}px`;
        element.style.letterSpacing = "0";

        while (
          nextSize > minimum &&
          (element.scrollHeight > element.clientHeight ||
            element.scrollWidth > element.clientWidth)
        ) {
          nextSize -= 0.5;
          element.style.fontSize = `${nextSize}px`;
        }

        const stillOverflowing =
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth;

        setFontSize(nextSize);
        setWarning(stillOverflowing);
      });
    };

    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children, max, min, lines]);

  return (
    <Component
      ref={ref}
      className={className}
      data-overflow-warning={warning ? "true" : "false"}
      title={title || (warning ? "Text may need shorter wording for print." : undefined)}
      style={{
        fontSize,
        WebkitLineClamp: lines,
        letterSpacing: 0,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
