import React, { useEffect, useRef } from "react";

const Chart: React.FC<{ data: number[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.5;
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height); // x-axis
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height); // y-axis
    ctx.stroke();

    // Y-axis scale markers
    const maxVal = Math.max(...data, 1);
    ctx.fillStyle = "black";
    ctx.font = "10px sans-serif";
    for (let i = 0; i <= 5; i++) {
      const yVal = Math.round((maxVal / 5) * i);
      const y = height - (yVal / maxVal) * height;
      ctx.fillText(yVal.toString(), 2, y - 2);
    }

    // Plot line
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    const stepX = width / data.length;
    data.forEach((val, i) => {
      const x = i * stepX;
      const y = height - (val / maxVal) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} width={400} height={200} />;
};

export default Chart;
