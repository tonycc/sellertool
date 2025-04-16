import React, { useEffect, useRef, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Empty } from 'antd';
import { KeywordData, MultiCampaignKeyword, ExtendedMultiCampaignKeyword } from '../../types/searchTermReportTypes';

// 支持关键词和多广告组关键词两种数据源
interface OrderKeywordChartProps {
  keywordsData: (KeywordData | MultiCampaignKeyword | ExtendedMultiCampaignKeyword)[];
  height?: number;
  title?: string;
  subTitle?: string;
}

/**
 * 出单关键词柱状图组件
 * 展示产生订单最多的搜索词及其销售额
 */
const OrderKeywordChart: React.FC<OrderKeywordChartProps> = ({
  keywordsData,
  height = 350,
  title = '出单关键词分析',
  subTitle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);
  
  // 处理数据，只显示有订单的关键词
  const processedData = (keywordsData || [])
    .filter(item => {
      if (item && 'totalOrders' in item) {
        return item.totalOrders > 0;
      } else if (item && 'orders' in item) {
        return item.orders > 0;
      }
      return false;
    })
    .map((item, index) => {
      if (item && 'totalOrders' in item) {
        return {
          keyword: item.keyword,
          orders: item.totalOrders,
          index: index + 1
        };
      } else if (item && 'orders' in item) {
        return {
          keyword: item.keyword,
          orders: item.orders,
          index: index + 1
        };
      }
      return {
        keyword: '',
        orders: 0,
        index: index + 1
      };
    })
    .sort((a, b) => b.orders - a.orders);
  
  // 监听容器大小变化
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setChartWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // 基础图表配置
  const config = {
    data: processedData,
    xField: 'index',
    yField: 'orders',
    label: {
      textBaseline: 'bottom',
    },
    axis: {
      label: {
        formatter: (text: string) => `#${text}`,
      },
    },
    tooltip: {
      title: (data: any) => data.keyword,
      showTitle: true,
      showMarkers: false
    },
    style: {
      // 圆角样式
      radiusTopLeft: 10,
      radiusTopRight: 10,
      maxWidth: 80,
    },
    width: chartWidth,
    height,
  };

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>{title}</h3>
      {subTitle && <p style={{ marginBottom: 16 }}>{subTitle}</p>}
      <div ref={containerRef} style={{ width: '100%' }}>
        {processedData.length > 0 ? (
          <Column {...config} />
        ) : (
          <Empty description="暂无出单关键词数据" />
        )}
      </div>
    </div>
  );
};

export default OrderKeywordChart; 