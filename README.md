# Performance-Critical Real-Time Dashboard (Next.js Version)

This project is a high-performance, real-time data visualization dashboard built with Next.js, React, TypeScript, and advanced browser APIs. It is architecturally designed to render and update over 10,000 data points at a smooth 60 frames per second (fps) by offloading all intensive processing and rendering to background threads.

## ✨ Screenshots

Here's a look at the dashboard in action, showcasing its clean UI and multiple chart visualizations.

*(Screenshot of the full dashboard layout)*
`[Image: Full dashboard view with all charts and controls]`

*(Screenshot highlighting the interactive line chart with zoom/pan functionality)*
`[Image: Close-up of the line chart demonstrating real-time updates]`

*(Screenshot showing the virtualized data table smoothly scrolling through data)*
`[Image: Data table view with a scrollbar, showing a small subset of the total rows]`


## 🚀 Features

- **Next.js App Router**: Built on the latest Next.js features for a robust and scalable application structure.
- **Server and Client Components**: The page shell is server-rendered for fast initial loads, while the dashboard itself is a client component to manage real-time updates.
- **Multi-Threaded Architecture**: Utilizes Web Workers for data processing and OffscreenCanvas for rendering to keep the main thread free and the UI ultra-responsive.
- **Multiple Chart Types**: Interactive Line chart and Scatter plot (with pan/zoom), plus Bar chart and Heatmap, all rendered in the background.
- **Real-Time Data Stream**: A worker thread simulates a continuous flow of data, updating every 50ms.
- **Interactive Controls**: Filter data by value range, select/deselect categories, and change the time window (1m, 5m, 1h) without blocking the UI.
- **Virtualized Data Table**: Renders only the visible rows in a table, allowing for smooth scrolling through thousands of data points.
- **Performance Monitor**: An integrated monitor displays real-time FPS and JavaScript heap memory usage.
- **PWA Ready**: Includes a Service Worker for offline caching and a Web App Manifest.

## ⚙️ Tech Stack

- **Next.js 14**: The React framework for production.
- **React 18**: For building the user interface with functional components and hooks.
- **TypeScript**: For static typing and improved developer experience.
- **Web Workers**: For background data generation, filtering, and aggregation.
- **HTML Canvas & OffscreenCanvas**: For highly performant, multi-threaded rendering of charts.
- **Service Workers**: For offline capabilities and resource caching.
- **Tailwind CSS**: For utility-first styling and responsive design.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- A modern web browser. See [Browser Compatibility](#-browser-compatibility) for details.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd performance-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## 🧪 Performance Testing

This dashboard is built for performance. Here's how you can verify it:

1.  **Built-in Performance Monitor**:
    -   The monitor in the top-right corner displays real-time **Frames Per Second (FPS)** and **Memory Usage (MB)**.
    -   **FPS**: Aim for a stable 58-60 FPS, even while interacting with filters or when the data table is scrolling.
    -   **Memory**: Memory usage should remain stable over time and not continuously increase, demonstrating that old data is being properly garbage-collected.

2.  **Browser Developer Tools**:
    -   **Performance Tab**: Open Chrome DevTools, go to the "Performance" tab, and record a profile for a few seconds while interacting with the app. The main thread's flame chart should show very little activity, with most of the time spent in "Idle". This proves that the heavy lifting is happening on worker threads.
    -   **Memory Tab**: Take heap snapshots over time to confirm there are no memory leaks. The memory should not grow unboundedly.

## 🧠 Architectural Overview

### Next.js Specific Optimizations

While the core real-time performance comes from browser APIs, Next.js provides a robust foundation:

-   **App Router**: Organizes the application into a logical, file-system-based routing structure.
-   **Server Components**: The root layout (`app/layout.tsx`) is a Server Component, delivering the initial HTML shell quickly without client-side JavaScript.
-   **Client Components**: The entire interactive dashboard (`app/dashboard/page.tsx`) is marked with `"use client"`, allowing it to use hooks, state, and browser-only APIs like Web Workers. This hybrid approach gives us a fast initial load combined with rich client-side interactivity.
-   **Font Optimization**: Uses `next/font` to automatically optimize and self-host the Inter font, improving loading performance and preventing layout shifts.

### Core Performance Strategies

This project employs several advanced strategies to achieve its performance goals:

1.  **Web Worker for Data Processing**: All intensive data logic—including the real-time stream generation, filtering based on user input, and data aggregation for charts—is executed in a separate Web Worker. This prevents any computation from blocking the main UI thread, ensuring controls remain instantly responsive.

2.  **OffscreenCanvas for Rendering**: All chart rendering is performed in a dedicated rendering worker. The main thread's only role is to create a `<canvas>` element and transfer its control to this worker. This completely decouples rendering from the React component lifecycle, guaranteeing that complex visualizations are drawn smoothly without affecting the main thread's performance.

3.  **Data Virtualization**: The data table uses virtual scrolling. Instead of rendering all 10,000+ rows, it only renders the ~20-30 rows that are currently visible in the viewport, plus a small "overscan" buffer. This keeps the DOM extremely light and scrolling instantaneous.

4.  **Memoization (`React.memo`, `useMemo`)**:
    -   Components are wrapped in `React.memo` to prevent re-renders if their props haven't changed.
    -   `useMemo` is used to memoize the data context value, preventing unnecessary re-renders of consumer components.

## 🖥️ Browser Compatibility

The core performance of this dashboard relies on **`OffscreenCanvas`**, which has varying levels of browser support.

| Browser         | `OffscreenCanvas` Support                               | Status         |
| --------------- | ------------------------------------------------------- | -------------- |
| **Chrome**      | ✅ Fully Supported                                      | **Recommended** |
| **Edge**        | ✅ Fully Supported                                      | **Recommended** |
| **Firefox**     | 🟡 Supported (behind a flag `gfx.offscreencanvas.enabled`) | Usable        |
| **Safari**      | 🟡 Partial Support (No support in Web Workers)           | **Not Working** |

For the best experience and to see the multi-threaded rendering in action, please use a Chromium-based browser like Google Chrome or Microsoft Edge. The application will not function correctly in browsers that do not support transferring an `OffscreenCanvas` to a Web Worker.
