import { useEffect, useRef, useCallback } from 'react';
import { ChartType } from '@/lib/types';

const workerScript = `
    // --- Inlined from lib/canvasUtils.ts ---
    function drawGrid(ctx, width, height, xOffset, yOffset, xSteps, ySteps, color) {
        ctx.save();
        ctx.translate(xOffset, yOffset);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        for (let i = 1; i < xSteps; i++) {
            const x = (i / xSteps) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let i = 1; i < ySteps; i++) {
            const y = (i / ySteps) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawTimeAxis(ctx, viewMinTimestamp, viewMaxTimestamp, width, height, padding) {
        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#cbd5e1'; // slate-300
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const duration = viewMaxTimestamp - viewMinTimestamp;
        
        const labelWidth = 80;
        let numLabels = Math.floor(width / labelWidth);
        numLabels = Math.min(numLabels, 10);
        numLabels = Math.max(numLabels, 2);

        if (duration > 0 && numLabels > 1) {
            for (let i = 0; i <= numLabels; i++) {
                const ratio = i / numLabels;
                const timestamp = viewMinTimestamp + ratio * duration;
                const x = padding + ratio * width;
                
                const timeString = new Date(timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });

                ctx.fillText(timeString, x, padding + height + 5);
            }
        }
        
        ctx.fillText("Time", padding + width / 2, padding + height + 25);
        ctx.restore();
    }

    function drawValueAxis(ctx, min, max, width, height, padding, numLabels = 5, horizontal = false, label = "Value") {
        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#cbd5e1'; // slate-300
        const range = max - min;
        if (range <= 0) {
            ctx.restore();
            return;
        }

        if (horizontal) { // Y-axis
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            for (let i = 0; i <= numLabels; i++) {
                const ratio = i / numLabels;
                const value = max - ratio * range;
                const y = padding + ratio * height;
                ctx.fillText(value.toFixed(0), padding - 8, y);
            }
            
            ctx.translate(15, padding + height/2);
            ctx.rotate(-Math.PI/2);
            ctx.textAlign = 'center';
            ctx.fillText(label, 0, 0);
        } else { // X-axis
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            for (let i = 0; i <= numLabels; i++) {
                const ratio = i / numLabels;
                const value = min + ratio * range;
                const x = padding + ratio * width;
                ctx.fillText(value.toFixed(0), x, padding + height + 5);
            }
            ctx.fillText(label, padding + width / 2, padding + height + 25);
        }
        
        ctx.restore();
    }
    
    // --- Color Palette ---
    const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
    const CATEGORY_COLORS = { A: '#14b8a6', B: '#8b5cf6', C: '#ec4899', D: '#f97316', E: '#38bdf8' };

    // --- Inlined from lib/chartDrawers.ts ---
    function drawLineChart(ctx, width, height, data, viewState) {
        if (data.length < 2) return;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const fullMinTimestamp = data[0].timestamp;
        const fullMaxTimestamp = data[data.length - 1].timestamp;
        const fullTimeRange = fullMaxTimestamp - fullMinTimestamp;
        const viewMinTimestamp = fullMinTimestamp + viewState.x.min * fullTimeRange;
        const viewMaxTimestamp = fullMinTimestamp + viewState.x.max * fullTimeRange;
        
        const fullValueMax = 100;
        const fullValueMin = 0;
        const fullValueRange = fullValueMax - fullValueMin;
        const viewValueMin = fullValueMin + viewState.y.min * fullValueRange;
        const viewValueMax = fullValueMin + viewState.y.max * fullValueRange;

        drawGrid(ctx, chartWidth, chartHeight, padding, padding, 10, 10, 'rgba(255, 255, 255, 0.1)');
        drawTimeAxis(ctx, viewMinTimestamp, viewMaxTimestamp, chartWidth, chartHeight, padding);
        drawValueAxis(ctx, viewValueMin, viewValueMax, chartWidth, chartHeight, padding, 5, true, "Value");
        
        ctx.save();
        ctx.translate(padding, padding);
        
        const visibleData = data.filter(p => p.timestamp >= viewMinTimestamp && p.timestamp <= viewMaxTimestamp);
        const viewTimeRange = viewMaxTimestamp - viewMinTimestamp;
        const viewValueRange = viewValueMax - viewValueMin;
        if (viewTimeRange <= 0 || viewValueRange <= 0) {
            ctx.restore();
            return;
        };

        ctx.beginPath();
        for (let i = 0; i < visibleData.length; i++) {
            const point = visibleData[i];
            const x = ((point.timestamp - viewMinTimestamp) / viewTimeRange) * chartWidth;
            const y = chartHeight - ((point.value - viewValueMin) / viewValueRange) * chartHeight;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    function drawBarChart(ctx, width, height, data) {
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barCount = CATEGORIES.length;
        const barWidth = chartWidth / barCount * 0.6;
        const barSpacing = chartWidth / barCount * 0.4;
        const maxCount = Math.max(1, ...Object.values(data));
        drawValueAxis(ctx, 0, maxCount, chartWidth, chartHeight, padding, 5, true, 'Count');
        
        ctx.save();
        ctx.translate(padding, padding);
        
        CATEGORIES.forEach((category, i) => {
            const count = data[category] || 0;
            const barHeight = (count / maxCount) * chartHeight;
            const x = i * (barWidth + barSpacing) + barSpacing / 2;
            const y = chartHeight - barHeight;
            
            ctx.fillStyle = CATEGORY_COLORS[category];
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.font = '12px sans-serif';
            ctx.fillText(category, x + barWidth / 2, chartHeight + 15);
        });
        ctx.restore();
    }

    function drawScatterPlot(ctx, width, height, data, viewState) {
        if (data.length === 0) return;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const fullLatencyMax = 500, fullLatencyMin = 0, fullLatencyRange = fullLatencyMax - fullLatencyMin;
        const viewLatencyMin = fullLatencyMin + viewState.x.min * fullLatencyRange;
        const viewLatencyMax = fullLatencyMin + viewState.x.max * fullLatencyRange;
        
        const fullValueMax = 100, fullValueMin = 0, fullValueRange = fullValueMax - fullValueMin;
        const viewValueMin = fullValueMin + viewState.y.min * fullValueRange;
        const viewValueMax = fullValueMin + viewState.y.max * fullValueRange;

        drawGrid(ctx, chartWidth, chartHeight, padding, padding, 10, 10, 'rgba(255, 255, 255, 0.1)');
        drawValueAxis(ctx, viewLatencyMin, viewLatencyMax, chartWidth, chartHeight, padding, 5, false, "Latency (ms)");
        drawValueAxis(ctx, viewValueMin, viewValueMax, chartWidth, chartHeight, padding, 5, true, "Value");
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.translate(padding, padding);

        const viewLatencyRange = viewLatencyMax - viewLatencyMin;
        const viewValueRange = viewValueMax - viewValueMin;
        if (viewLatencyRange <= 0 || viewValueRange <= 0) {
            ctx.restore();
            return;
        }

        const visibleData = data.filter(p => p.latency >= viewLatencyMin && p.latency <= viewLatencyMax && p.value >= viewValueMin && p.value <= viewValueMax);
        
        ctx.fillStyle = '#38bdf8'; // sky-500
        for (const point of visibleData) {
            const x = ((point.latency - viewLatencyMin) / viewLatencyRange) * chartWidth;
            const y = chartHeight - ((point.value - viewValueMin) / viewValueRange) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    const TIME_BINS = 12;
    function drawHeatmap(ctx, width, height, data) {
        const grid = Array(CATEGORIES.length).fill(0).map(() => Array(TIME_BINS).fill(0));
        let maxCount = 0;
        if (data.length > 0) {
            const minTimestamp = data[0].timestamp;
            const maxTimestamp = data[data.length - 1].timestamp;
            const timeSpan = maxTimestamp - minTimestamp;
            if (timeSpan > 0) {
                for (const point of data) {
                    const categoryIndex = CATEGORIES.indexOf(point.category);
                    const timeRatio = (point.timestamp - minTimestamp) / timeSpan;
                    const timeIndex = Math.floor(timeRatio * TIME_BINS);
                    if (categoryIndex !== -1 && timeIndex >= 0 && timeIndex < TIME_BINS) {
                        grid[categoryIndex][timeIndex]++;
                        if (grid[categoryIndex][timeIndex] > maxCount) {
                            maxCount = grid[categoryIndex][timeIndex];
                        }
                    }
                }
            }
        }
        if (maxCount === 0) return;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const cellWidth = chartWidth / TIME_BINS;
        const cellHeight = chartHeight / CATEGORIES.length;

        for (let i = 0; i < CATEGORIES.length; i++) {
            for (let j = 0; j < TIME_BINS; j++) {
                const count = grid[i][j];
                const intensity = count / maxCount;
                ctx.fillStyle = \`rgba(6, 182, 212, \${intensity})\`;
                ctx.fillRect(padding + j * cellWidth, padding + i * cellHeight, cellWidth, cellHeight);
            }
        }
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < CATEGORIES.length; i++) {
            ctx.fillText(CATEGORIES[i], padding - 15, padding + i * cellHeight + cellHeight / 2);
        }
        ctx.textAlign = 'center';
        ctx.fillText("Time Bins", padding + chartWidth/2, padding + chartHeight + 30);
    }
    
    // --- Original render.worker.ts logic ---
    let ctx = null;
    let width = 0;
    let height = 0;
    let currentChartType = null;
    let currentData = null;
    let animationFrameId = null;

    const chartDrawers = {
        line: drawLineChart,
        bar: drawBarChart,
        scatter: drawScatterPlot,
        heatmap: drawHeatmap,
    };
    
    // --- Zoom/Pan State ---
    const viewStates = {
        line: { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } },
        scatter: { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } },
    };
    let isPanning = false;
    let lastPanPosition = { x: 0, y: 0 };


    function render() {
        if (ctx && width > 0 && height > 0) {
            ctx.clearRect(0, 0, width, height);
            if(currentChartType && currentData) {
                const drawFunction = chartDrawers[currentChartType];
                if (drawFunction) {
                    const viewState = viewStates[currentChartType];
                    drawFunction(ctx, width, height, currentData, viewState);
                }
            }
        }
        animationFrameId = self.requestAnimationFrame(render);
    }

    self.onmessage = (e) => {
        const { type, payload } = e.data;

        switch (type) {
            case 'init':
                const canvas = payload.canvas;
                ctx = canvas.getContext('2d');
                width = payload.width;
                height = payload.height;
                canvas.width = width * payload.dpr;
                canvas.height = height * payload.dpr;
                ctx.scale(payload.dpr, payload.dpr);
                if (animationFrameId === null) {
                    render();
                }
                break;
            case 'resize':
                width = payload.width;
                height = payload.height;
                if (ctx?.canvas) {
                    ctx.canvas.width = width * payload.dpr;
                    ctx.canvas.height = height * payload.dpr;
                    ctx.scale(payload.dpr, payload.dpr);
                }
                break;
            case 'render':
                currentChartType = payload.chartType;
                currentData = payload.data;
                break;
            case 'pan-start':
                isPanning = true;
                lastPanPosition = payload;
                break;
            case 'pan-move': {
                if (!isPanning) break;
                const vs = viewStates[currentChartType];
                if (!vs) break;

                const dx = payload.x - lastPanPosition.x;
                const dy = payload.y - lastPanPosition.y;
                lastPanPosition = payload;
                
                const xRange = vs.x.max - vs.x.min;
                const yRange = vs.y.max - vs.y.min;

                const xDelta = (dx / width) * xRange;
                const yDelta = (dy / height) * yRange;

                vs.x.min = Math.max(0, vs.x.min - xDelta);
                vs.x.max = vs.x.min + xRange;
                if (vs.x.max > 1) {
                    vs.x.max = 1;
                    vs.x.min = vs.x.max - xRange;
                }

                vs.y.min = Math.max(0, vs.y.min + yDelta);
                vs.y.max = vs.y.min + yRange;
                if (vs.y.max > 1) {
                    vs.y.max = 1;
                    vs.y.min = vs.y.max - yRange;
                }
                break;
            }
            case 'pan-end':
                isPanning = false;
                break;
            case 'zoom': {
                const vs = viewStates[currentChartType];
                if (!vs) break;
                const { x, y, delta } = payload;
                const zoomFactor = delta < 0 ? 1.1 : 0.9;
                
                const padding = 40;
                const chartWidth = width - padding * 2;
                const chartHeight = height - padding * 2;
                if (x < padding || x > width - padding || y < padding || y > height - padding) break;

                const xMouseRatio = (x - padding) / chartWidth;
                const yMouseRatio = 1 - ((y - padding) / chartHeight);

                const xRange = vs.x.max - vs.x.min;
                const newXRange = Math.max(0.01, xRange * zoomFactor);
                const xRangeDelta = newXRange - xRange;
                vs.x.min = Math.max(0, vs.x.min - xRangeDelta * xMouseRatio);
                vs.x.max = Math.min(1, vs.x.min + newXRange);
                if (vs.x.max - vs.x.min < newXRange) { // Adjust if clamped
                  vs.x.min = vs.x.max - newXRange;
                }


                const yRange = vs.y.max - vs.y.min;
                const newYRange = Math.max(0.01, yRange * zoomFactor);
                const yRangeDelta = newYRange - yRange;
                vs.y.min = Math.max(0, vs.y.min - yRangeDelta * yMouseRatio);
                vs.y.max = Math.min(1, vs.y.min + newYRange);
                if (vs.y.max - vs.y.min < newYRange) {
                   vs.y.min = vs.y.max - newYRange;
                }
                break;
            }
            case 'reset-zoom':
                const chartToReset = payload.chartType;
                if (viewStates[chartToReset]) {
                    viewStates[chartToReset] = { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } };
                }
                break;
        }
    };
`;

export const useOffscreenCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  chartType: ChartType,
  data: any
) => {
  const workerRef = useRef<Worker | null>(null);
  const isInteractive = chartType === 'line' || chartType === 'scatter';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.transferControlToOffscreen !== 'function') {
        console.warn('OffscreenCanvas is not supported or canvas is not available.');
        return;
    };

    try {
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl);
        
        const offscreenCanvas = canvas.transferControlToOffscreen();
        const dpr = window.devicePixelRatio || 1;

        const { width, height } = canvas.getBoundingClientRect();
        
        workerRef.current.postMessage({ 
            type: 'init', 
            payload: { canvas: offscreenCanvas, width, height, dpr }
        }, [offscreenCanvas]);

        const resizeObserver = new ResizeObserver(entries => {
          if (!entries || entries.length === 0) return;
          const entry = entries[0];
          const { width, height } = entry.contentRect;
          workerRef.current?.postMessage({ 
              type: 'resize', 
              payload: { width, height, dpr } 
          });
        });

        resizeObserver.observe(canvas);
        
        // --- Event listeners for zoom/pan ---
        const handleMouseDown = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) e.target.style.cursor = 'grabbing';
            workerRef.current?.postMessage({ type: 'pan-start', payload: { x: e.offsetX, y: e.offsetY } });
        }
        const handleMouseMove = (e: MouseEvent) => { if (e.buttons === 1) workerRef.current?.postMessage({ type: 'pan-move', payload: { x: e.offsetX, y: e.offsetY } }); };
        const handleMouseUp = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) e.target.style.cursor = 'grab';
            workerRef.current?.postMessage({ type: 'pan-end' });
        }
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) e.target.style.cursor = 'grab';
            workerRef.current?.postMessage({ type: 'pan-end' });
        }
        const handleWheel = (e: WheelEvent) => { e.preventDefault(); workerRef.current?.postMessage({ type: 'zoom', payload: { x: e.offsetX, y: e.offsetY, delta: e.deltaY } }); };
        
        if (isInteractive) {
            canvas.style.cursor = 'grab';
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }
        
        URL.revokeObjectURL(workerUrl);

        return () => {
          resizeObserver.disconnect();
          if (isInteractive) {
              canvas.style.cursor = 'default';
              canvas.removeEventListener('mousedown', handleMouseDown);
              canvas.removeEventListener('mousemove', handleMouseMove);
              canvas.removeEventListener('mouseup', handleMouseUp);
              canvas.removeEventListener('mouseleave', handleMouseLeave);
              canvas.removeEventListener('wheel', handleWheel);
          }
          workerRef.current?.terminate();
        };
    } catch(error) {
        console.error('Failed to initialize render worker:', error);
    }
  }, [canvasRef, isInteractive]);

  useEffect(() => {
    workerRef.current?.postMessage({
      type: 'render',
      payload: { chartType, data }
    });
  }, [chartType, data]);

  const resetZoom = useCallback(() => {
    workerRef.current?.postMessage({ type: 'reset-zoom', payload: { chartType } });
  }, [chartType]);
  
  return { resetZoom };
};
