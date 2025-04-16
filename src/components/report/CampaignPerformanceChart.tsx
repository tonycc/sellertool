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
  value: number;
  name: string;
}

// 图表数据返回接口
interface ChartData {
  barData: BarData[];
  lineData: LineData[];
}

// 将campaignData转换为分组柱线图表所需的数据格式
const transformCampaignDataForChart = (data: CampaignData[]): ChartData => {
  // 按广告活动名称分组并合并数据，以便图表正确显示
  const campaignMap = new Map<string, CampaignData>();
  
  data.forEach(item => {
    const campaignName = item.campaignName;
    
    if (campaignMap.has(campaignName)) {
      // 如果已存在该广告活动，累加数据
      const existingCampaign = campaignMap.get(campaignName)!;
      existingCampaign.impressions += item.impressions;
      existingCampaign.clicks += item.clicks;
      existingCampaign.spend += item.spend;
      existingCampaign.sales += item.sales;
      existingCampaign.orders += item.orders;
    } else {
      // 否则，添加新的广告活动
      campaignMap.set(campaignName, {
        ...item
      });
    }
  });
  
  // 转换为数组并计算派生指标
  const mergedData = Array.from(campaignMap.values()).map(campaign => ({
    ...campaign,
    acos: campaign.sales > 0 ? campaign.spend / campaign.sales : 0,
    roas: campaign.spend > 0 ? campaign.sales / campaign.spend : 0,
    ctr: campaign.impressions > 0 ? campaign.clicks / campaign.impressions : 0,
    conversionRate: campaign.clicks > 0 ? campaign.orders / campaign.clicks : 0,
    cpc: campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0
  }));
  
  // 限制显示的广告活动数量，避免图表过于拥挤
  const limitedData = mergedData.slice(0, 10);
  
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
      value: Number(campaign.acos), // 确保是小数形式，如0.12表示12%
      name: 'ACOS',
    });
    lineData.push({
      campaign: campaign.campaignName,
      value: Number(campaign.ctr), // 确保是小数形式，如0.05表示5%
      name: 'CTR'
    });
    lineData.push({
      campaign: campaign.campaignName,
      value: Number(campaign.conversionRate), // 确保是小数形式，如0.05表示5%
      name: 'CVR'
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
    //console.log('lineData samples:', lineData.slice(0, 3));
    // 添加useEffect钩子监听Tab切换和容器尺寸变化
    useEffect(() => {
      // Force chart re-render
      setChartKey(prevKey => prevKey + 1);
      
      // Create ResizeObserver with direct ref usage
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === chartContainerRef.current) {
            // Force chart re-render when container size changes
            setChartKey(prevKey => prevKey + 1);
          }
        }
      });
      
      // Observe chart container using ref
      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }
      
      // Cleanup function
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
      scale: { series: { independent: true,} },
      children: [
        {
          data: barData,
          type: 'interval',
          yField: 'value',
          seriesField: 'type',
          colorField: 'type',
          group: true,
          style: { maxWidth: 80,},
          interaction: { elementHighlight: { background: true } },
        },
        {
          data: lineData,
          type: 'line',
          yField: 'value',
          seriesField: 'name',
          colorField: 'name',
          shapeField: 'smooth',
          style: { lineWidth: 2 },          
          axis: {
            y: {
              position: 'right',
              title: 'ACOS/CTR/CVR',
              labelFormatter: (v:number | undefined) => v !== undefined ? formatPercentage(v) : formatPercentage(0),                        
            }
          },
          interaction: {
            tooltip: {
              marker: true,
              crosshairs: false,
            },
          },
          tooltip: {
            items: [
              (datum:any) => ({
                name: datum.name,
                value: `${(datum.value * 100).toFixed(2)}%`
              })
            ],
          }
        },
      ]     
    }
  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px`, minHeight: '400px' }}>
      <DualAxes key={chartKey} {...config} height={height || 400} />
    </div>
  );
};

export default CampaignPerformanceChart;