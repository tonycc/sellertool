import React, { useEffect, useRef, useState } from 'react';
import { DualAxes } from '@ant-design/plots';
import { formatPercentage } from '../../utils/formatters';


// 广告活动数据接口
interface CampaignData {
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
  ctr: number;
  conversionRate: number;
  cpc: number;
}

interface CampaignPerformanceChartProps {
  campaignData: CampaignData[];
  title?: string;
  height?: number;
}

// 柱状图数据接口
interface BarData {
  campaign: string;
  value: number;
  type: string;
}

// 折线图数据接口
interface LineData {
  campaign: string;
  count: number;
  name: string;
}

// 图表数据返回接口
interface ChartData {
  barData: BarData[];
  lineData: LineData[];
}

// 将campaignData转换为分组柱线图表所需的数据格式
const transformCampaignDataForChart = (data: CampaignData[]): ChartData => {
  
  // 限制显示的广告活动数量，避免图表过于拥挤
  const limitedData = data.slice(0, 10);
  
  // 转换为适合分组柱状图的数据格式
  const barData: BarData[] = [];
  limitedData.forEach(campaign => {
    barData.push({
      campaign: campaign.campaignName,
      value: campaign.spend,
      type: '花费'
    });
    barData.push({
      campaign: campaign.campaignName,
      value: campaign.sales,
      type: '销售额'
    });
  });
  
  // 转换为适合折线图的数据格式
  const lineData : LineData[] = [];
  limitedData.forEach(campaign => {
    // 确保ACOS和CTR值被正确转换为小数形式，而不是百分比形式
    // formatPercentage函数会将小数值乘以100并添加%符号
    lineData.push({
      campaign: campaign.campaignName,
      count: Number(campaign.acos), // 确保是小数形式，如0.12表示12%
      name: 'ACOS'
    });
    lineData.push({
      campaign: campaign.campaignName,
      count: Number(campaign.ctr), // 确保是小数形式，如0.05表示5%
      name: 'CTR'
    });
  });
  return { barData, lineData };
};


// 获取图表数据
const getChartData = (data: CampaignData[] | undefined): ChartData => {
  
  if (data && data.length > 0) {
    return transformCampaignDataForChart(data);
  }
  
  // 返回默认空数据结构，避免图表渲染错误
  return { barData: [] as BarData[], lineData: [] as LineData[] };
};

const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({campaignData, height = 400}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartKey, setChartKey] = useState<number>(0);
    
    const { barData, lineData } = getChartData(campaignData);
    
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
    }, [campaignData]); // 当campaignData变化时重新渲染    
    // 获取图表实例
    const config = {     
      xField: "campaign",
     
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
          //seriesField: 'name',
          colorField: 'name',
          shapeField: 'smooth',
          style: { lineWidth: 2 },
          axis: {
            y: {
              position: 'right',
              title: 'ACOS/CTR',
              grid: null,
              labelFormatter: (v:number | undefined) => v !== undefined? formatPercentage(v) : '0.00%',                        
            }
          },
          scale: { series: { independent: true } },
          tooltip: {
            showMarkers: false,
            showCrosshairs: true,
            //shared: true,
            items: [{ channel: 'y', valueFormatter: (d:number) => `${(d * 100).toFixed(2)}%` }],
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

export default CampaignPerformanceChart;