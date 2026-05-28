import { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { counselorLogin, studentLogin } from '@/utils/api'
import { saveAuth, gotoHome, getUser, getToken } from '@/utils/auth'
import './index.scss'

type Role = 'student' | 'counselor'

export default function Login() {
  const [role, setRole] = useState<Role>('student')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 已登录 → 直接进入对应首页
    const u = getUser()
    const t = getToken()
    if (u && t) gotoHome(u)
  }, [])

  const onSubmit = async () => {
    const acc = account.trim()
    const pwd = password.trim()

    // 演示模式：账号/密码为空时直接进首页（仅用于预览 UI）
    if (!acc || !pwd) {
      const target = role === 'counselor'
        ? '/pages/counselor/home/index'
        : '/pages/student/home/index'
      Taro.reLaunch({ url: target })
      return
    }

    setLoading(true)
    const res = role === 'counselor'
      ? await counselorLogin(acc, pwd)
      : await studentLogin(acc, pwd)
    setLoading(false)

    if (res.code === 0 && res.data) {
      saveAuth(res.data.token, res.data.user)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => gotoHome(res.data.user), 500)
    } else {
      Taro.showToast({ title: res.msg || '登录失败', icon: 'none' })
    }
  }

  return (
    <View className='login'>
      <View className='login__hero'>
        <View className='login__brand'>
          <View className='login__brand-mark' />
          <Text className='login__brand-name'>MAIPsy</Text>
        </View>
        <Text className='login__title'>你好</Text>
        <Text className='login__subtitle'>登录账号，开始你的心理旅程</Text>
      </View>

      <View className='login__tabs'>
        <View className={`login__tabs-indicator ${role === 'counselor' ? 'is-right' : ''}`} />
        <View
          className={`login__tab ${role === 'student' ? 'is-active' : ''}`}
          onClick={() => setRole('student')}
        >
          <Text>学生</Text>
        </View>
        <View
          className={`login__tab ${role === 'counselor' ? 'is-active' : ''}`}
          onClick={() => setRole('counselor')}
        >
          <Text>辅导员</Text>
        </View>
      </View>

      <View className='login__form'>
        <View className='login__field login__field-1'>
          <Text className='login__label'>{role === 'student' ? '学号' : '账号'}</Text>
          <Input
            className='login__input'
            placeholder={role === 'student' ? '请输入学号' : '请输入邮箱'}
            value={account}
            onInput={(e) => setAccount(e.detail.value)}
          />
        </View>

        <View className='login__field login__field-2'>
          <Text className='login__label'>密码</Text>
          <Input
            className='login__input'
            password
            placeholder='请输入密码'
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <Button
          className='login__submit'
          loading={loading}
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? '登录中…' : '登 录'}
        </Button>
      </View>

      <View className='login__footer'>
        <Text>MAIPsy · 数据加密传输</Text>
      </View>
    </View>
  )
}
