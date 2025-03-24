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
  return isNaN(numValue) ? '¥0.00' : `¥${numValue.toFixed(2)}`;
};