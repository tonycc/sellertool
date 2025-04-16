/**
 * 报告类别和类型配置文件
 * 定义了上传报告时可选择的类别和类型
 */

const reportCategories = [
  {
    value: 'sp',
    label: '商品推广',
    children: [
      {
        value: 'SEARCH_TERM_REPORT',
        label: '搜索词报告'
      },
      {
        value: 'TARGET_REPORT',
        label: '投放报告'
      },
      {
        value: 'TARGETING_REPORT',
        label: '按时间查看效果'
      },
      {
        value: 'AD_PLACEMENT_REPORT',
        label: '广告位报告'
      }
    ]
  },
  {
    value: 'sb',
    label: '品牌推广',
    children: [
      {
        value: 'KEYWORD_REPORT',
        label: '关键词'
      },
      {
        value: 'CAMPAIGN_REPORT',
        label: '广告活动'
      },
     
    ]
  },
];

export default reportCategories;