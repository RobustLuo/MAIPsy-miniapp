import { request, ApiResponse } from './request'

export interface UserInfo {
  uid: string
  name: string
  role: 'student' | 'counselor'
  avatar_url: string
  email: string
  school_name: string
  email_verified: number
  gender: string
  profile_completed: number
  student_id?: string
  class_name?: string
}

interface LoginData {
  token: string
  user: UserInfo
}

/** 辅导员邮箱+密码登录 */
export function counselorLogin(email: string, password: string) {
  return request<LoginData>({
    url: '/auth/counselor-login',
    method: 'POST',
    data: { email, password },
    needAuth: false,
  })
}

/** 学生学号+密码登录 */
export function studentLogin(student_id: string, password: string) {
  return request<LoginData>({
    url: '/auth/student-login',
    method: 'POST',
    data: { student_id, password },
    needAuth: false,
  })
}

/** 获取当前用户信息 */
export function getMe() {
  return request<{ user: UserInfo }>({ url: '/user/me' })
}
