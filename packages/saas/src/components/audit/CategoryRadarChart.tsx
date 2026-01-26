import { useEffect, useRef } from 'react';

interface CategoryRadarChartProps {
  categories: {
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
    socialMeta?: number;
    aiReadiness?: number;
  };
}

export function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Category labels and values
    const labels = [
      { key: 'crawlability', label: 'Crawlability' },
      { key: 'onPage', label: 'On-Page' },
      { key: 'content', label: 'Content' },
      { key: 'performance', label: 'Performance' },
      { key: 'security', label: 'Security' },
      { key: 'socialMeta', label: 'Social' },
      { key: 'aiReadiness', label: 'AI Ready' },
    ];

    const numPoints = labels.length;
    const angleStep = (2 * Math.PI) / numPoints;

    // Draw background circles
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const ringRadius = (radius * i) / 5;
      for (let j = 0; j <= numPoints; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + ringRadius * Math.cos(angle);
        const y = centerY + ringRadius * Math.sin(angle);
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw spokes
    ctx.strokeStyle = '#e5e7eb';
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    labels.forEach((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      ctx.fillText(item.label, x, y);
    });

    // Draw data polygon
    const points: { x: number; y: number }[] = [];
    labels.forEach((item, i) => {
      const value = (categories[item.key as keyof typeof categories] || 0) / 100;
      const angle = i * angleStep - Math.PI / 2;
      const pointRadius = radius * value;
      points.push({
        x: centerX + pointRadius * Math.cos(angle),
        y: centerY + pointRadius * Math.sin(angle),
      });
    });

    // Fill polygon
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();

    // Stroke polygon
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = 'rgb(59, 130, 246)';
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [categories]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="max-w-full"
      />
    </div>
  );
}
