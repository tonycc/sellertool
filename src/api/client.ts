import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const errorMessage = error.response.data?.message || '请求发生错误';
      
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
      
      // 处理401未授权错误
      if (error.response.status === 401) {
        // 清除本地存储的认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 可以在这里添加重定向到登录页面的逻辑
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      } else {
      // 请求配置出错
      
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