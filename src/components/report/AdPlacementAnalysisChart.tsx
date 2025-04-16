import React, { useEffect, useRef, useState } from 'react';
import { DualAxes } from '@ant-design/plots';
import { formatPercentage } from '../../utils/formatters';

// 广告位数据接口
interface PlacementData {
  placement: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
  ctr: number;
  conversionRate: number;
}

interface AdPlacementAnalysisChartProps {
  placementData: PlacementData[];
  title?: string;
  height?: number;
}

// 柱状图数据接口
interface BarData {
  placement: string;
  value: number;
  type: string;
}

// 折线图数据接口
interface LineData {
  placement: string;
  count: number;
  name: string;
}

// 图表数据返回接口
interface ChartData {
  barData: BarData[];
  lineData: LineData[];
}

// 将placementData转换为分组柱线图表所需的数据格式
const transformPlacementDataForChart = (data: PlacementData[]): ChartData => {
  // 转换为适合分组柱状图的数据格式
  const barData: BarData[] = [];
  data.forEach(placement => {
    barData.push({
      placement: placement.placement,
      value: Number(Number(placement.spend).toFixed(2)),
      type: '花费'
    });
    barData.push({
      placement: placement.placement,
      value: Number(Number(placement.sales).toFixed(2)),
      type: '销售额'
    });
  });
  
  // 转换为适合折线图的数据格式
  const lineData : LineData[] = [];
  data.forEach(placement => {
    lineData.push({
      placement: placement.placement,
      count: Number(placement.acos), // 确保是小数形式，如0.12表示12%
      name: 'ACOS'
    });
    lineData.push({
      placement: placement.placement,
      count: Number(placement.ctr), // 确保是小数形式，如0.05表示5%
      name: 'CTR'
    });
  });
  return { barData, lineData };
};

// 获取图表数据
const getChartData = (data: PlacementData[] | undefined): ChartData => {
  if (data && data.length > 0) {
    return transformPlacementDataForChart(data);
  }
  
  // 返回默认空数据结构，避免图表渲染错误
  return { barData: [] as BarData[], lineData: [] as LineData[] };
};

const AdPlacementAnalysisChart: React.FC<AdPlacementAnalysisChartProps> = ({placementData, height = 400}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartKey, setChartKey] = useState<number>(0);
    const { barData, lineData } = getChartData(placementData);
    
    // 添加useEffect钩子监听Tab切换和容器尺寸变化
    useEffect(() => {
        // 强制图表重新渲染
        setChartKey(prevKey => prevKey + 1);        
        // 创建ResizeObserver监听容器尺寸变化
        const resizeObserver = new ResizeObserver(() => {
            // 当容器尺寸变化时，强制图表重新渲染
            setChartKey(prevKey => prevKey + 1);
        });        
        // 监听图表容器
        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }        
        // 清理函数
        return () => {
            if (chartContainerRef.current) {
                resizeObserver.unobserve(chartContainerRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [placementData]); // 当placementData变化时重新渲染    
    
    // 配置图表
    const config = {     
      xField: "placement",
      scale: { series: { independent: true } },
      children: [
        {
          data: barData,
          type: 'interval',
          yField: 'value',
          seriesField: 'type',
          colorField: 'type',
          group: true,
          style: { maxWidth: 80},
          interaction: { elementHighlight: { background: true } }
        },
        {
          data: lineData,
          type: 'line',
          yField: 'count',
          colorField: 'name',
          shapeField: 'smooth',
          style: { lineWidth: 2 },
          axis: {
            y: {
              position: 'right',
              title: 'ACOS/CTR',
              labelFormatter: (v:number | undefined) => v !== undefined? formatPercentage(v) : '0.00%',                        
            }
          },
          interaction: { 
            tooltip: {
             marker:true,
             crosshairs: false, 
            }
          },         
          tooltip: {
            items: [
              (datum:any) => ({
                name: datum.name,
                value: `${(datum.count * 100).toFixed(2)}%`
              })
             ],
           }         
           
        }
      ]     
    }
  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px`, minHeight: '400px' }}>
      <DualAxes key={chartKey} {...config} height={height || 400} />
    </div>
  );
};

export default AdPlacementAnalysisChart;