import Taro from '@tarojs/taro'

export const API_BASE = 'https://maipsy.cn/api'

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  needAuth?: boolean
}

export async function request<T = any>(opts: RequestOptions): Promise<ApiResponse<T>> {
  const token = Taro.getStorageSync('token')
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.needAuth !== false && token) {
    header['Authorization'] = 'Bearer ' + token
  }

  try {
    const res = await Taro.request({
      url: API_BASE + opts.url,
      method: opts.method || 'GET',
      data: opts.data,
      header,
      timeout: 15000,
    })
    return res.data as ApiResponse<T>
  } catch (err) {
    return { code: -1, msg: '网络错误，请检查连接', data: null as any }
  }
}
