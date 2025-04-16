/**
 * 格式化数值为百分比显示
 * @param value 需要格式化的数值
 * @returns 格式化后的百分比字符串，例如：'12.34%'
 */
export const formatPercentage = (value: any): string => {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(numValue) ? '0.00%' : `${(numValue*100).toFixed(2)}%`;
};

/**
 * 格式化数值为人民币显示
 * @param value 需要格式化的数值
 * @returns 格式化后的人民币字符串，例如：'¥12.34'
 */
export const formatCurrency = (value: any): string => {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(numValue) ? '0.00' : `${numValue.toFixed(2)}`;
};


/**
 * 判断字符串是否为百分比字段名
 */
const isPercentageField = (fieldName: string): boolean => {
  const percentageKeywords = ['率', 'rate', 'percentage', 'percent', 'ctr', '转化率', 'conversion','acos'];
  const result = percentageKeywords.some(keyword => 
    fieldName.toLowerCase().includes(keyword.toLowerCase())
  );
  return result;
};

/**
 * 判断字符串是否为金额字段名
 */
const isMonetaryField = (fieldName: string): boolean => {
  const monetaryKeywords = ['金额', '花费', 'cost', 'price', 'amount', 'spend', 'roas', 'cpc', '成本'];
  const result = monetaryKeywords.some(keyword => 
    fieldName.toLowerCase().includes(keyword.toLowerCase())
  );
  return result;
};

/**
 * 格式化数值，根据字段名自动判断格式化规则
 * @param value 需要格式化的数值
 * @param fieldName 字段名称
 * @returns 格式化后的字符串
 */
export const formatNumber = (value: any, fieldName: string): string => {
  // 输入值检查
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  // 确保value是数字
  let numValue: number;
  try {
    // 处理不同类型的输入值
    if (typeof value === 'number') {
      numValue = value;
    } else if (typeof value === 'string') {
      // 移除可能的千分位分隔符和其他非数字字符（保留小数点和负号）
      const cleanedValue = String(value).trim().replace(/[^-\d.]/g, '');
      numValue = parseFloat(cleanedValue);
    } else {
      // 尝试转换其他类型
      numValue = parseFloat(String(value).trim());
    }
    
    if (isNaN(numValue)) {
      return String(value);
    }
    
  } catch (e) {
    console.error(`转换值为数字时出错: ${value}`, e);
    return String(value);
  }
  
  // 特殊字段处理
  // 检查是否为点击率(CTR)字段
  const isCTRField = fieldName.toLowerCase().includes('ctr') || 
                    fieldName.toLowerCase().includes('点击率');
  
  // 检查是否为ROAS字段
  const isROASField = fieldName.toLowerCase().includes('roas') || 
                     fieldName.toLowerCase().includes('广告投资回报率');
  //检查是否位ACOS字段
  const isACOSField = fieldName.toLowerCase().includes('acos') ||
                     fieldName.toLowerCase().includes('广告投入产出比');                   

  let result = '-';
  // 根据字段名判断格式化规则
  if (isCTRField) {
    // 点击率(CTR)特殊处理，通常是0-1之间的小数
    if (numValue >= 0 && numValue <= 1) {
      // 已经是小数形式，直接乘以100并保留4位小数
      result = `${(numValue * 100).toFixed(4)}%`;
    } else if (numValue > 1 && numValue <= 100) {
      // 已经是百分比数值，直接保留4位小数
      result = `${numValue.toFixed(4)}%`;
    } else {
      // 其他情况，可能是千分比等，尝试合理展示
      result = `${numValue.toFixed(4)}%`;
    }
  } else if (isROASField) {
    // ROAS特殊处理，通常是数值
    result = numValue.toFixed(2);
  } else if (isACOSField) {
    // ACOS特殊处理，通常是百分数
    result = `${(numValue * 100).toFixed(2)}%`;
  } else if (isPercentageField(fieldName)) {
    // 其他百分比字段处理
    if (numValue >= 0 && numValue <= 1) {
      // 已经是百分比形式，直接乘以100并保留2位小数
      result = `${(numValue * 100).toFixed(2)}%`;
    } else {
      // 已经是百分比数值（大于1），直接保留2位小数
      result = `${numValue.toFixed(2)}%`;
    }
  } else if (isMonetaryField(fieldName)) {
    // 金额字段保留2位小数
    result = numValue.toFixed(2);
  } else {
    // 其他数值字段根据数值大小自动调整精度
    if (Math.abs(numValue) >= 1000000) {
      // 大于等于1M的数值显示为'xxM'
      result = `${(numValue / 1000000).toFixed(2)}M`;
    } else if (Math.abs(numValue) >= 1000) {
      // 大于等于1K的数值显示为'xxK'
      result = `${(numValue / 1000).toFixed(2)}K`;
    } else if (Number.isInteger(numValue)) {
      // 整数直接显示
      result = numValue.toString();
    } else {
      // 小数保留2位
      result = numValue.toFixed(2);
    }
  }
  
  return result;
};