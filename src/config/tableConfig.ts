import { useState } from 'react';
import type { ProTableProps } from '@ant-design/pro-components';

// 表格状态接口
interface TableState {
  pageSize: number;
  currentPage: number;
}

// 表格状态Hook参数接口
interface UseTableStateProps {
  defaultPageSize?: number;
  defaultCurrentPage?: number;
}

// 表格配置相关函数
export const getDefaultSearchConfig = (): {
  labelWidth: 'auto';
  filterType: 'light'; 
} => ({
  labelWidth: 'auto',
  filterType: 'light',
});

export const getDefaultOptionsConfig = () => ({
  density: false,
  fullScreen: true,
  reload: false,
  setting: true,
});

export const getDefaultTableConfig = <T extends Record<string, any>>(): Partial<ProTableProps<T, Record<string, any>>> => ({
  search: getDefaultSearchConfig(),
  options: getDefaultOptionsConfig(),
  pagination: {
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: (total) => `共 ${total} 条记录`,
  },
  dateFormatter: 'string',
  scroll: { x: 1200 },
});

// 获取分页配置
export const getTablePaginationConfig = ({
  pageSize,
  currentPage,
  onChange,
}: {
  pageSize: number;
  currentPage: number;
  onChange: (page: number, size: number) => void;
}) => ({
  pageSize,
  current: currentPage,
  onChange,
  ...getDefaultTableConfig().pagination,
});

// 表格状态管理Hook（从useTableState.ts整合）
export const useTableState = ({
  defaultPageSize = 10,
  defaultCurrentPage = 1
}: UseTableStateProps = {}) => {
  const [state, setState] = useState<TableState>({
    pageSize: defaultPageSize,
    currentPage: defaultCurrentPage
  });

  const handlePaginationChange = (page: number, size: number) => {
    setState({
      currentPage: page,
      pageSize: size
    });
  };

  return {
    pageSize: state.pageSize,
    currentPage: state.currentPage,
    handlePaginationChange,
    paginationConfig: getTablePaginationConfig({
      pageSize: state.pageSize,
      currentPage: state.currentPage,
      onChange: handlePaginationChange
    })
  };
};