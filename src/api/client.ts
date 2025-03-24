import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 添加全局静默配置
  silent: false
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const errorMessage = error.response.data?.message || '请求发生错误';
      
      // 统一处理401未授权错误
      if (error.response.status === 401) {
        const errorData = error.response.data;
        // 清除本地存储的认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return Promise.reject({
          silent: true,
          message: errorData?.message || errorMessage,
          errorType: errorData?.errorType || 'authentication_failed'
        });
      }

      // 处理400客户端错误
      if (error.response.status === 400) {
        return Promise.reject(new Error(errorMessage));
      }
      
      // 处理409冲突错误
      if (error.response.status === 409) {
        const errorData = error.response.data;
        return Promise.reject({
          message: errorData.message,
          errorType: errorData.errorType
        });
      }
      
      // 处理404未找到错误
      if (error.response.status === 404) {
        return Promise.reject({
          silent: true,
          message: '请求资源不存在',
          errorType: 'not_found'
        });
      }

      // 处理403禁止访问错误（如邮箱未验证）
      if (error.response.status === 403) {
        const errorData = error.response.data;
        
        // 仅在非静默模式且开发环境下显示调试日志
        // 增强错误对象结构校验
      if (!errorData || typeof errorData !== 'object') {
        return Promise.reject({
          message: '无效的错误响应格式',
          errorType: 'invalid_error_format'
        });
      }

      // 严格静默模式判断（优先使用errorData中的silent标记）
      const isSilent = errorData?.silent || error.config?.silent;
      
      // 开发环境调试日志（仅非静默模式时显示）
      // 仅在未启用静默模式时记录日志
if (process.env.NODE_ENV === 'development' && !isSilent && !error.config?.silent) {
        console.log('[调试] 403响应数据:', error.response?.data);
      }

      // 错误日志输出逻辑（完全静默时不输出）
      // 当未启用静默模式时输出错误日志
if (!isSilent && !error.config?.silent) {
        console.error('[调试] Forbidden error:', {
          message: errorData?.message,
          errorType: errorData?.errorType,
          path: error.config?.url
        });
      }
        
        return Promise.reject({
          silent: errorData?.silent || false,
          message: errorData?.message || errorMessage,
          errorType: errorData?.errorType || 'forbidden'
        });
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      return Promise.reject({
        message: '服务器无响应，请检查网络连接',
        errorType: 'network_error'
      });
    } else {
      // 请求配置出错
      return Promise.reject({
        message: '请求配置错误',
        errorType: 'request_error'
      });
    }
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.get(url, { params, ...config })
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.post(url, data, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.put(url, data, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装DELETE请求
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.delete(url, config)
    .then((response: AxiosResponse<T>) => response.data);
};

export default apiClient;