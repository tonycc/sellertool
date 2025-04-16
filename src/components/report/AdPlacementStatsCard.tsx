import React, { ReactNode } from 'react';
import { StatisticCard } from '@ant-design/pro-components';
import type { StatisticProps } from '@ant-design/pro-components';

interface AdPlacementStatsCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: string;
  precision?: number;
  formatter?: StatisticProps['formatter'];
  valueStyle?: React.CSSProperties;
  colSpan?: { xs: number; sm: number; md: number; lg: number } | number;
  style?: React.CSSProperties;
}

/**
 * 广告位统计卡片组件
 * 用于展示广告位报表中的统计数据，统一样式和布局
 */
const AdPlacementStatsCard: React.FC<AdPlacementStatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  formatter,
  valueStyle,
  colSpan = { xs: 24, sm: 12, md: 6, lg: 3 },
  style = { padding: '1px', margin: '0' },
}) => {
  return (
    <StatisticCard
      colSpan={colSpan}
      statistic={{
        title,
        value,
        prefix,
        suffix,
        precision,
        formatter,
        valueStyle,
      }}
      style={style}
    />
  );
};

export default AdPlacementStatsCard;