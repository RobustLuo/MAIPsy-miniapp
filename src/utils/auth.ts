import Taro from '@tarojs/taro'
import type { UserInfo } from './api'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function saveAuth(token: string, user: UserInfo) {
  Taro.setStorageSync(TOKEN_KEY, token)
  Taro.setStorageSync(USER_KEY, user)
}

export function clearAuth() {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || ''
}

export function getUser(): UserInfo | null {
  const u = Taro.getStorageSync(USER_KEY)
  return u || null
}

/** 更新当前用户字段（如头像、姓名） */
export function updateUser(patch: Partial<UserInfo>) {
  const u = getUser()
  if (!u) return null
  const next = { ...u, ...patch }
  Taro.setStorageSync(USER_KEY, next)
  return next
}

/** 根据用户角色跳转首页 */
export function gotoHome(user: UserInfo) {
  const url = user.role === 'counselor'
    ? '/pages/counselor/home/index'
    : '/pages/student/home/index'
  Taro.reLaunch({ url })
}

/** 启动时自动跳转：已登录 → 首页，未登录 → 登录页 */
export function bootstrapNavigate() {
  const user = getUser()
  const token = getToken()
  if (token && user) {
    gotoHome(user)
  } else {
    Taro.reLaunch({ url: '/pages/login/index' })
  }
}
