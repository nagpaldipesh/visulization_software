import React, { useMemo } from 'react';
import Plot from 'react-plotly.js'; // Real import

// --- SVG Icon ---
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Embedded Styles ---
const ChartStyles = () => (
  <style>{`
    :root {
      --danger-color: #dc3545;
      --border-color: #dee2e6;
    }
    .chart-item-wrapper {
      height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: #fff;
    }
    .chart-delete-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
      background: rgba(220, 53, 69, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .chart-delete-btn:hover {
      background: rgba(220, 53, 69, 1);
    }
    .chart-image-container {
      padding: 10px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box; /* Ensure padding is included in height */
    }
    .chart-image-title {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .chart-image {
      max-width: 100%;
      height: auto;
      flex-grow: 1;
      object-fit: contain;
    }
  `}</style>
);


const ChartComponent = ({ chartConfig, onDelete, filteredDataCount }) => {
    
    if (!chartConfig || !chartConfig.chartData) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: Invalid chart data.</div>;
    }

    const baseTitle = chartConfig.hypertuneParams?.custom_title || `${chartConfig.chartType} of ${chartConfig.columnMapping.x_axis || chartConfig.columnMapping.names || 'Data'}`;
    let chartData = chartConfig.chartData;
    
    // Core logic to make the title dynamic
    const isPlotly = typeof chartData === 'object';
    const dynamicTitle = `${baseTitle} (n=${filteredDataCount})`;
    
    // Only Plotly charts can easily have their layout title updated client-side
    // We use useMemo to prevent re-calculating this on every render unless chartData or dynamicTitle changes
    const finalChartData = useMemo(() => {
        if (isPlotly) {
            return {
                ...chartData,
                layout: {
                    ...chartData.layout,
                    // Update title to show filter count (simulating data linkage)
                    title: { text: dynamicTitle, font: { size: 14 } },
                }
            };
        }
        return chartData; // Return the original (e.g., image string) if not Plotly
    }, [chartData, isPlotly, dynamicTitle]);
    
    const plotLayout = useMemo(() => isPlotly ? {
        ...finalChartData.layout,
        autosize: true, 
        margin: { l: 40, r: 20, t: 40, b: 40 }, 
        legend: { font: { size: 10 } }
    } : null, [isPlotly, finalChartData]);

    const isImage = typeof chartData === 'string' && chartData.startsWith('data:image');

    return (
        <div className="chart-item-wrapper">
            <ChartStyles />
            <button 
                onClick={() => onDelete(chartConfig.id)} 
                className="chart-delete-btn"
                title="Remove chart"
            >
                <IconX />
            </button>
            
            {isPlotly && (
                <Plot
                    data={finalChartData.data}
                    layout={plotLayout}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false, responsive: true }}
                />
            )}
            
            {isImage && (
                <div className="chart-image-container">
                    <h5 className="chart-image-title">{dynamicTitle}</h5>
                    <img 
                        src={chartData} 
                        alt={baseTitle} 
                        className="chart-image"
                    />
                </div>
            )}
            
        </div>
    );
};

export default ChartComponent;