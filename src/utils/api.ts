import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.maipsy.cn'  // 替换为真实后端地址

export function request<T>(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  data?: object
): Promise<T> {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => reject(err)
    })
  })
}

export interface SurveyInfo {
  id: string
  title: string
  description: string
  estimatedMinutes: number
  questions: Question[]
}

export interface Question {
  id: string
  index: number
  text: string
  options: { value: number; label: string }[]
}

export interface SubmitResult {
  totalScore: number
  level: 'low' | 'mild' | 'moderate' | 'severe'
  levelText: string
  summary: string
  suggestion: string
}

export interface AssignedSurvey {
  id: string
  title: string
  description: string
  estimatedMinutes: number
  deadline: string
  publishedBy: string
  status: 'pending' | 'completed'
}

export const wxLogin = (code: string) =>
  request<{ token: string; studentName: string }>('/auth/wx-login', 'POST', { code })

export const getAssignedSurveys = () =>
  request<AssignedSurvey[]>('/student/surveys')

export const getSurvey = (surveyId: string) =>
  request<SurveyInfo>(`/survey/${surveyId}`)

export const submitSurvey = (surveyId: string, answers: Record<string, number>) =>
  request<SubmitResult>('/survey/submit', 'POST', { surveyId, answers })
