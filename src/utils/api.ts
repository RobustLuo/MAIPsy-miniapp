import Taro from '@tarojs/taro'

const BASE_URL = 'https://maipsy.cn/api'

// ---- 通用请求 ----
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export function request<T>(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  data?: object
): Promise<ApiResponse<T>> {
  const token = Taro.getStorageSync('token') || ''
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as ApiResponse<T>)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

// ---- 类型定义 ----
export interface AssignedSurvey {
  uid: string
  title: string
  scale_name: string
  class_name: string
  status: string
  response_count: number
  deadline: string | null
  created_at: string | null
}

export interface QuestionOption {
  label: string
  score: number
}

export interface Question {
  id: number
  seq: number
  content: string
  options: QuestionOption[]
}

export interface AssessmentDetail {
  assessment: {
    uid: string
    title: string
    scale_name: string
    question_count: number
  }
  questions: Question[]
}

export interface SubmitResult {
  total_score: number
  result_level: string
  result_label: string
  is_warning: number
}

export interface SubmitAnswer {
  question_id: number
  score: number
  duration_ms?: number
}

// ---- API 方法 ----

/** 微信登录 */
export const wxLogin = (code: string) =>
  request<{ token: string; user: any }>('/auth/login', 'POST', { code })

/** 获取所有进行中的测评（公开，无需 token） */
export const getAssessmentList = () =>
  request<{ assessments: AssignedSurvey[] }>('/assessment/active')

/** 获取测评详情和题目（学生答题用） */
export const getAssessmentDetail = (uid: string) =>
  request<AssessmentDetail>(`/assessment/detail/${uid}`)

/** 提交答题 */
export const submitAssessment = (
  assessmentUid: string,
  studentName: string,
  answers: SubmitAnswer[],
  studentId?: string,
  studentClass?: string,
) =>
  request<SubmitResult>('/assessment/submit', 'POST', {
    assessment_uid: assessmentUid,
    student_name: studentName,
    student_id: studentId || '',
    student_class: studentClass || '',
    answers,
  })
