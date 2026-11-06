import React, { useEffect, useState } from 'react';

export const CountUp = ({
  end = 0,
  start = 0,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = Number(end) || 0;
    const startValue = Number(start) || 0;

    if (endValue === startValue) {
      setCount(endValue);
      return;
    }

    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * ease;
      setCount(current);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [end, start, duration]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
