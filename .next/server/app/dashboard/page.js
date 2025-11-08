(()=>{var e={};e.id=702,e.ids=[702],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9117:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>r.a,__next_app__:()=>m,originalPathname:()=>x,pages:()=>d,routeModule:()=>h,tree:()=>c}),a(9521),a(3321),a(1506),a(5866);var n=a(3191),i=a(8716),s=a(7922),r=a.n(s),l=a(5231),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);a.d(t,o);let c=["",{children:["dashboard",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,9521)),"C:\\Users\\kumar\\Downloads\\real-time-performance-dashboard (1)\\app\\dashboard\\page.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,3321)),"C:\\Users\\kumar\\Downloads\\real-time-performance-dashboard (1)\\app\\dashboard\\layout.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,1506)),"C:\\Users\\kumar\\Downloads\\real-time-performance-dashboard (1)\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,5866,23)),"next/dist/client/components/not-found-error"]}],d=["C:\\Users\\kumar\\Downloads\\real-time-performance-dashboard (1)\\app\\dashboard\\page.tsx"],x="/dashboard/page",m={require:a,loadChunk:()=>Promise.resolve()},h=new n.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/dashboard/page",pathname:"/dashboard",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},170:(e,t,a)=>{Promise.resolve().then(a.bind(a,9197))},6270:(e,t,a)=>{Promise.resolve().then(a.t.bind(a,2994,23)),Promise.resolve().then(a.t.bind(a,6114,23)),Promise.resolve().then(a.t.bind(a,9727,23)),Promise.resolve().then(a.t.bind(a,9671,23)),Promise.resolve().then(a.t.bind(a,1868,23)),Promise.resolve().then(a.t.bind(a,4759,23))},6434:()=>{},5303:()=>{},9197:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>_});var n=a(326),i=a(7577),s=a.n(i);let r=`
  // Inlined from lib/dataGenerator.ts
  const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
  let lastId = 0;

  function generateDataPoint(timestamp, prevValue) {
    const value = prevValue !== null
      ? Math.max(0, Math.min(100, prevValue + (Math.random() - 0.5) * 5))
      : 50 + (Math.random() - 0.5) * 20;
      
    return {
      id: ++lastId,
      timestamp,
      value,
      latency: 50 + Math.random() * 450,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    };
  };

  function generateInitialData(count, timeWindowMs) {
    const data = [];
    const now = Date.now();
    const timeStep = timeWindowMs / count;
    let lastValue = null;
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - timeWindowMs + i * timeStep;
      const point = generateDataPoint(timestamp, lastValue);
      data.push(point);
      lastValue = point.value;
    }
    return data;
  };

  function generateNewDataPoint(lastPoint) {
      const lastValue = lastPoint ? lastPoint.value : 50;
      return generateDataPoint(Date.now(), lastValue);
  }

  // Original data.worker.ts logic
  const DATA_GENERATION_INTERVAL = 50; // ms

  const timeRangeToMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  };

  let data = [];
  let timeRange = '1m';
  let filters = null;
  let intervalId = null;

  // Re-create the Set for selectedCategories since it doesn't transfer well
  function processData() {
    if (!filters) return;
    const selectedCategories = new Set(filters.selectedCategories);
    const filteredData = data.filter(d =>
      d.value >= filters.valueMin &&
      d.value <= filters.valueMax &&
      selectedCategories.has(d.category)
    );

    const aggregateData = filteredData.reduce((acc, point) => {
      acc[point.category] = (acc[point.category] || 0) + 1;
      return acc;
    }, {});

    const message = {
      type: 'data-update',
      payload: { data, filteredData, aggregateData }
    };
    postMessage(message);
  }

  function initializeAndStream() {
    if (intervalId) clearInterval(intervalId);

    postMessage({ type: 'loading', payload: true });

    setTimeout(() => {
      const windowSize = timeRangeToMs[timeRange];
      const maxDataPoints = windowSize / DATA_GENERATION_INTERVAL;
      data = generateInitialData(maxDataPoints, windowSize);

      postMessage({ type: 'loading', payload: false });
      processData();

      intervalId = self.setInterval(() => {
        const newDataPoint = generateNewDataPoint(data[data.length - 1]);
        const now = newDataPoint.timestamp;
        const windowSize = timeRangeToMs[timeRange];

        let startIndex = 0;
        for (let i = 0; i < data.length; i++) {
          if (now - data[i].timestamp < windowSize) {
            startIndex = i;
            break;
          }
        }
        
        const newWindow = startIndex > 0 ? data.slice(startIndex) : data;
        data = [...newWindow, newDataPoint];
        processData();
      }, DATA_GENERATION_INTERVAL);
    }, 100);
  }

  self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
      case 'init':
        timeRange = payload.timeRange;
        filters = payload.filters;
        // The Set object does not transfer via postMessage, so we receive an empty object.
        // We convert it back to a plain array on the main thread and rebuild it here.
        filters.selectedCategories = new Set(filters.selectedCategories);
        initializeAndStream();
        break;
      case 'set-timerange':
        timeRange = payload;
        initializeAndStream();
        break;
      case 'set-filters':
        filters = payload;
        filters.selectedCategories = new Set(filters.selectedCategories);
        processData();
        break;
    }
  };
`,l=(e,t)=>{let[a,n]=(0,i.useState)([]),[s,l]=(0,i.useState)([]),[o,c]=(0,i.useState)({}),[d,x]=(0,i.useState)(!0),m=(0,i.useRef)(null);return(0,i.useEffect)(()=>{try{let a=new Blob([r],{type:"application/javascript"}),i=URL.createObjectURL(a);m.current=new Worker(i),m.current.onmessage=e=>{let{type:t,payload:a}=e.data;"data-update"===t?(n(a.data),l(a.filteredData),c(a.aggregateData)):"loading"===t&&x(a)};let s={...t,selectedCategories:Array.from(t.selectedCategories)};m.current.postMessage({type:"init",payload:{timeRange:e,filters:s}}),URL.revokeObjectURL(i)}catch(e){console.error("Failed to initialize data worker:",e),x(!1)}return()=>{m.current?.terminate()}},[]),(0,i.useEffect)(()=>{m.current?.postMessage({type:"set-timerange",payload:e})},[e]),(0,i.useEffect)(()=>{let e={...t,selectedCategories:Array.from(t.selectedCategories)};m.current?.postMessage({type:"set-filters",payload:e})},[t]),{data:a,filteredData:s,aggregateData:o,loading:d}},o=(0,i.createContext)(void 0),c=["A","B","C","D","E"],d=({children:e})=>{let[t,a]=(0,i.useState)("1m"),[s,r]=(0,i.useState)({valueMin:0,valueMax:100,selectedCategories:new Set(c)}),{data:d,filteredData:x,aggregateData:m,loading:h}=l(t,s),u=(0,i.useMemo)(()=>({data:d,filteredData:x,aggregateData:m,timeRange:t,setTimeRange:a,filters:s,setFilters:r,loading:h}),[d,x,m,t,s]);return n.jsx(o.Provider,{value:u,children:e})},x=()=>{let e=(0,i.useContext)(o);if(void 0===e)throw Error("useData must be used within a DataProvider");return e},m=`
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
`,h=(e,t,a)=>{let n=(0,i.useRef)(null),s="line"===t||"scatter"===t;return(0,i.useEffect)(()=>{let t=e.current;if(!t||"function"!=typeof t.transferControlToOffscreen){console.warn("OffscreenCanvas is not supported or canvas is not available.");return}try{let e=new Blob([m],{type:"application/javascript"}),a=URL.createObjectURL(e);n.current=new Worker(a);let i=t.transferControlToOffscreen(),r=window.devicePixelRatio||1,{width:l,height:o}=t.getBoundingClientRect();n.current.postMessage({type:"init",payload:{canvas:i,width:l,height:o,dpr:r}},[i]);let c=new ResizeObserver(e=>{if(!e||0===e.length)return;let{width:t,height:a}=e[0].contentRect;n.current?.postMessage({type:"resize",payload:{width:t,height:a,dpr:r}})});c.observe(t);let d=e=>{e.target instanceof HTMLElement&&(e.target.style.cursor="grabbing"),n.current?.postMessage({type:"pan-start",payload:{x:e.offsetX,y:e.offsetY}})},x=e=>{1===e.buttons&&n.current?.postMessage({type:"pan-move",payload:{x:e.offsetX,y:e.offsetY}})},h=e=>{e.target instanceof HTMLElement&&(e.target.style.cursor="grab"),n.current?.postMessage({type:"pan-end"})},u=e=>{e.target instanceof HTMLElement&&(e.target.style.cursor="grab"),n.current?.postMessage({type:"pan-end"})},g=e=>{e.preventDefault(),n.current?.postMessage({type:"zoom",payload:{x:e.offsetX,y:e.offsetY,delta:e.deltaY}})};return s&&(t.style.cursor="grab",t.addEventListener("mousedown",d),t.addEventListener("mousemove",x),t.addEventListener("mouseup",h),t.addEventListener("mouseleave",u),t.addEventListener("wheel",g,{passive:!1})),URL.revokeObjectURL(a),()=>{c.disconnect(),s&&(t.style.cursor="default",t.removeEventListener("mousedown",d),t.removeEventListener("mousemove",x),t.removeEventListener("mouseup",h),t.removeEventListener("mouseleave",u),t.removeEventListener("wheel",g)),n.current?.terminate()}}catch(e){console.error("Failed to initialize render worker:",e)}},[e,s]),(0,i.useEffect)(()=>{n.current?.postMessage({type:"render",payload:{chartType:t,data:a}})},[t,a]),{resetZoom:(0,i.useCallback)(()=>{n.current?.postMessage({type:"reset-zoom",payload:{chartType:t}})},[t])}},u=s().memo(()=>{let{filteredData:e}=x(),t=(0,i.useRef)(null),{resetZoom:a}=h(t,"line",e);return(0,n.jsxs)("div",{className:"relative w-full h-full group",children:[n.jsx("canvas",{ref:t,className:"w-full h-full"}),n.jsx("button",{onClick:a,className:"absolute top-2 right-2 px-2 py-1 text-xs bg-gray-600/70 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none ring-2 ring-transparent focus:ring-cyan-500","aria-label":"Reset Zoom",children:"Reset"})]})}),g=s().memo(()=>{let{aggregateData:e}=x(),t=(0,i.useRef)(null);return h(t,"bar",e),n.jsx("canvas",{ref:t,className:"w-full h-full"})}),p=s().memo(()=>{let{filteredData:e}=x(),t=(0,i.useRef)(null),{resetZoom:a}=h(t,"scatter",e);return(0,n.jsxs)("div",{className:"relative w-full h-full group",children:[n.jsx("canvas",{ref:t,className:"w-full h-full"}),n.jsx("button",{onClick:a,className:"absolute top-2 right-2 px-2 py-1 text-xs bg-gray-600/70 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none ring-2 ring-transparent focus:ring-cyan-500","aria-label":"Reset Zoom",children:"Reset"})]})}),v=s().memo(()=>{let{filteredData:e}=x(),t=(0,i.useRef)(null);return h(t,"heatmap",e),n.jsx("canvas",{ref:t,className:"w-full h-full"})}),f=["A","B","C","D","E"],w=s().memo(()=>{let{filters:e,setFilters:t}=x(),a=(0,i.useCallback)(e=>{t(t=>{let a=new Set(t.selectedCategories);return a.has(e)?a.delete(e):a.add(e),{...t,selectedCategories:a}})},[t]),s=(0,i.useCallback)(e=>{let{name:a,value:n}=e.target,i=Number(n);t(e=>{let t={...e,[a]:i};return"valueMin"===a&&i>t.valueMax&&(t.valueMax=i),"valueMax"===a&&i<t.valueMin&&(t.valueMin=i),t})},[t]);return(0,n.jsxs)("div",{className:"space-y-4",children:[n.jsx("h3",{className:"text-lg font-semibold text-slate-300",children:"Filters"}),(0,n.jsxs)("div",{children:[(0,n.jsxs)("label",{htmlFor:"valueMin",className:"block text-sm font-medium text-slate-400",children:["Value Range: ",e.valueMin," - ",e.valueMax]}),(0,n.jsxs)("div",{className:"mt-2 flex flex-col gap-4 pt-2",children:[n.jsx("input",{type:"range",id:"valueMin",name:"valueMin",min:"0",max:"100",value:e.valueMin,onChange:s,className:"w-full","aria-label":"Minimum Value"}),n.jsx("input",{type:"range",id:"valueMax",name:"valueMax",min:"0",max:"100",value:e.valueMax,onChange:s,className:"w-full","aria-label":"Maximum Value"})]})]}),(0,n.jsxs)("div",{children:[n.jsx("label",{className:"block text-sm font-medium text-slate-400",children:"Categories"}),n.jsx("div",{className:"mt-2 grid grid-cols-3 gap-2",children:f.map(t=>n.jsx("button",{onClick:()=>a(t),className:`px-3 py-1 text-sm rounded-md transition-all duration-200 font-medium focus:outline-none ring-2 ring-transparent focus:ring-cyan-500 ${e.selectedCategories.has(t)?"bg-cyan-500 text-white":"bg-slate-700 hover:bg-slate-600 text-slate-300"}`,children:t},t))})]})]})}),y=[{value:"1m",label:"Last 1 Minute"},{value:"5m",label:"Last 5 Minutes"},{value:"1h",label:"Last 1 Hour"}],b=s().memo(()=>{let{timeRange:e,setTimeRange:t,loading:a}=x(),s=(0,i.useCallback)(e=>{t(e.target.value)},[t]);return(0,n.jsxs)("div",{className:"w-full",children:[n.jsx("label",{htmlFor:"time-range-selector",className:"sr-only",children:"Time Range"}),(0,n.jsxs)("div",{className:"relative",children:[n.jsx("select",{id:"time-range-selector",value:e,onChange:s,disabled:a,className:"w-full bg-slate-700/50 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none",children:y.map(e=>n.jsx("option",{value:e.value,children:e.label},e.value))}),n.jsx("div",{className:"pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400",children:n.jsx("svg",{className:"fill-current h-4 w-4",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",children:n.jsx("path",{d:"M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"})})})]}),a&&n.jsx("p",{className:"text-sm text-yellow-500 mt-1 absolute",children:"Loading..."})]})}),M=({itemHeight:e,containerHeight:t,itemCount:a,scrollTop:n,overscan:s=5})=>{let{startIndex:r,endIndex:l,virtualItems:o,totalHeight:c}=(0,i.useMemo)(()=>{let i=a*e,r=Math.floor(n/e),l=Math.ceil((n+t)/e);r=Math.max(0,r-s),l=Math.min(a-1,l+s);let o=[];for(let t=r;t<=l;t++)o.push({index:t,style:{position:"absolute",top:t*e,left:0,width:"100%",height:e}});return{startIndex:r,endIndex:l,virtualItems:o,totalHeight:i}},[e,t,a,n,s]);return{startIndex:r,endIndex:l,virtualItems:o,totalHeight:c}},j={A:"bg-teal-500/20 text-teal-300 border-teal-500/30",B:"bg-purple-500/20 text-purple-300 border-purple-500/30",C:"bg-pink-500/20 text-pink-300 border-pink-500/30",D:"bg-orange-500/20 text-orange-300 border-orange-500/30",E:"bg-sky-500/20 text-sky-300 border-sky-500/30"},R=()=>(0,n.jsxs)("div",{className:"grid grid-cols-data-table gap-4 px-4 sticky top-0 z-10 bg-slate-800/80 backdrop-blur-lg text-xs text-cyan-400 uppercase font-semibold h-10 items-center border-b border-white/10",children:[n.jsx("div",{className:"text-right",children:"ID"}),n.jsx("div",{className:"text-left",children:"Timestamp"}),n.jsx("div",{className:"text-right",children:"Value"}),n.jsx("div",{className:"text-right",children:"Latency (ms)"}),n.jsx("div",{className:"text-center",children:"Category"})]}),T=s().memo(({item:e,style:t})=>(0,n.jsxs)("div",{className:"grid grid-cols-data-table gap-4 px-4 items-center border-b border-white/5 hover:bg-white/10 transition-colors duration-150",style:t,children:[n.jsx("div",{className:"font-medium text-slate-300 whitespace-nowrap text-right",children:e.id}),(0,n.jsxs)("div",{className:"whitespace-nowrap text-slate-400",children:[new Date(e.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),".",String(e.timestamp%1e3).padStart(3,"0")]}),n.jsx("div",{className:"text-right text-slate-300",children:e.value.toFixed(2)}),n.jsx("div",{className:"text-right text-slate-300",children:e.latency.toFixed(2)}),n.jsx("div",{className:"text-center flex justify-center items-center",children:n.jsx("span",{className:`px-2 py-0.5 text-xs font-medium rounded-full border ${j[e.category]}`,children:e.category})})]})),C=()=>{let{filteredData:e}=x(),t=(0,i.useRef)(null),[a,s]=(0,i.useState)(0),[r,l]=(0,i.useState)(0);(0,i.useEffect)(()=>{let e=t.current;if(!e)return;let a=new ResizeObserver(()=>{l(e.clientHeight)});return a.observe(e),l(e.clientHeight),()=>a.disconnect()},[]);let{virtualItems:o,totalHeight:c}=M({itemCount:e.length,containerHeight:r,itemHeight:36,scrollTop:a});return(0,n.jsxs)("div",{ref:t,onScroll:e=>{s(e.currentTarget.scrollTop)},className:"h-full w-full overflow-y-auto rounded text-sm",children:[n.jsx(R,{}),n.jsx("div",{style:{height:c,position:"relative"},children:o.map(({index:t,style:a})=>{let i=e[t];return i?n.jsx(T,{item:i,style:a},i.id):null})})]})},S=()=>{let[e,t]=(0,i.useState)(0),[a,n]=(0,i.useState)(0),s=(0,i.useRef)(performance.now()),r=(0,i.useRef)(0),l=(0,i.useRef)(null);return(0,i.useEffect)(()=>{let e=a=>{r.current++;let i=a-s.current;i>=1e3&&(t(1e3*r.current/i),performance.memory&&n(performance.memory.usedJSHeapSize/1048576),s.current=a,r.current=0),l.current=requestAnimationFrame(e)};return l.current=requestAnimationFrame(e),()=>{l.current&&cancelAnimationFrame(l.current)}},[]),{fps:e,memoryUsage:a}},k=({children:e})=>n.jsx("div",{className:"text-slate-400 w-5 h-5",children:e}),L=()=>n.jsx(k,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M3 7.5l3 1.5M3 7.5l-1.5-1.5m1.5 1.5l-1.5 1.5m16.5-3l1.5 1.5m-1.5-1.5l1.5-1.5M12 9.75l-1.5-1.5M15 12l-3-3m0 0l-3 3m3-3v12"})})}),N=()=>n.jsx(k,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"})})}),V=s().memo(()=>{let{fps:e,memoryUsage:t}=S();return(0,n.jsxs)("div",{className:"glass-card flex items-center gap-4 px-3 py-2 text-sm",children:[(0,n.jsxs)("div",{className:"flex items-center gap-2",children:[n.jsx(L,{}),(0,n.jsxs)("div",{className:"flex items-baseline gap-1.5",children:[n.jsx("span",{className:"font-bold text-green-400 w-[2ch] text-right",children:e.toFixed(0)}),n.jsx("span",{className:"text-xs text-slate-400",children:"FPS"})]})]}),n.jsx("div",{className:"border-l border-white/10 h-5"}),(0,n.jsxs)("div",{className:"flex items-center gap-2",children:[n.jsx(N,{}),(0,n.jsxs)("div",{className:"flex items-baseline gap-1.5",children:[n.jsx("span",{className:"font-bold text-sky-400 w-[4ch] text-right",children:t.toFixed(1)}),n.jsx("span",{className:"text-xs text-slate-400",children:"MB"})]})]})]})}),A=({children:e})=>n.jsx("div",{className:"text-cyan-400 w-6 h-6 flex-shrink-0",children:e}),E=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"})})}),D=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"})})}),I=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5v-1.5M3.375 19.5h1.5v-1.5M3.375 19.5v-1.5m1.5 1.5v-1.5m14.25-15v1.5m1.5-1.5v1.5m-1.5-1.5h-1.5v1.5M19.5 4.5v1.5m-1.5-1.5v1.5m-14.25 0v15m17.25-15v15M4.875 4.5h14.25M4.875 4.5a1.125 1.125 0 01-1.125-1.125M4.875 4.5v-1.5m-1.5 1.5v-1.5m1.5 1.5h-1.5v-1.5M4.875 19.5v-15m14.25 15v-15"})})}),P=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"})})}),W=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"})})}),H=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"})})}),z=()=>n.jsx(A,{children:n.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:n.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"})})}),O=()=>(0,n.jsxs)("header",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4",children:[(0,n.jsxs)("div",{className:"flex items-center gap-3",children:[n.jsx(E,{}),(0,n.jsxs)("div",{children:[n.jsx("h1",{className:"text-4xl font-bold bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent",children:"Real-Time Dashboard"}),n.jsx("p",{className:"text-slate-400 mt-1",children:"Visualizing 10,000+ data points at 60fps."})]})]}),(0,n.jsxs)("div",{className:"flex items-center gap-4 w-full md:w-auto",children:[n.jsx("div",{className:"flex-1",children:n.jsx(b,{})}),n.jsx(V,{})]})]}),B=({title:e,children:t,className:a="",icon:i})=>(0,n.jsxs)("div",{className:`glass-card p-4 flex flex-col ${a}`,children:[(0,n.jsxs)("div",{className:"flex items-center gap-2 mb-2 flex-shrink-0",children:[i,n.jsx("h3",{className:"text-lg font-semibold text-cyan-400",children:e})]}),n.jsx("div",{className:"flex-1 relative min-h-0",children:t})]}),_=()=>((0,i.useEffect)(()=>{"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(e=>{console.log("Service Worker registered with scope:",e.scope)}).catch(e=>{console.error("Service Worker registration failed: ",e)})})},[]),n.jsx(d,{children:(0,n.jsxs)("div",{className:"min-h-screen bg-slate-900 text-slate-300 p-4 lg:p-6 font-sans flex flex-col",children:[n.jsx(O,{}),(0,n.jsxs)("main",{className:"flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6",children:[(0,n.jsxs)("div",{className:"lg:col-span-2 flex flex-col gap-6",children:[n.jsx(B,{title:"Value over Time",icon:n.jsx(D,{}),className:"h-[40vh] min-h-[300px]",children:n.jsx(u,{})}),n.jsx(B,{title:"Real-Time Data Table (Virtualized)",icon:n.jsx(I,{}),className:"h-[45vh] min-h-[300px]",children:n.jsx(C,{})})]}),(0,n.jsxs)("div",{className:"lg:col-span-1 flex flex-col gap-6",children:[n.jsx(B,{title:"Controls",icon:n.jsx(P,{}),children:n.jsx(w,{})}),n.jsx(B,{title:"Value vs. Latency",icon:n.jsx(W,{}),className:"h-[300px]",children:n.jsx(p,{})}),n.jsx(B,{title:"Category Distribution",icon:n.jsx(H,{}),className:"h-[300px]",children:n.jsx(g,{})}),n.jsx(B,{title:"Event Frequency",icon:n.jsx(z,{}),className:"h-[300px]",children:n.jsx(v,{})})]})]})]})}))},3321:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>i});var n=a(9510);function i({children:e}){return n.jsx(n.Fragment,{children:e})}a(1159)},9521:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>r,__esModule:()=>s,default:()=>l});var n=a(8570);let i=(0,n.createProxy)(String.raw`C:\Users\kumar\Downloads\real-time-performance-dashboard (1)\app\dashboard\page.tsx`),{__esModule:s,$$typeof:r}=i;i.default;let l=(0,n.createProxy)(String.raw`C:\Users\kumar\Downloads\real-time-performance-dashboard (1)\app\dashboard\page.tsx#default`)},1506:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>l,metadata:()=>r});var n=a(9510),i=a(4976),s=a.n(i);a(7272);let r={title:"Real-Time Performance Dashboard",description:"A high-performance dashboard for visualizing real-time data streams using custom-built charts with React and Canvas. It is designed to render over 10,000 data points at 60fps.",manifest:"/manifest.json",themeColor:"#0D1117"};function l({children:e}){return n.jsx("html",{lang:"en",children:n.jsx("body",{className:`${s().variable} font-sans bg-slate-900 text-slate-300 antialiased`,children:e})})}},7272:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),n=t.X(0,[103],()=>a(9117));module.exports=n})();