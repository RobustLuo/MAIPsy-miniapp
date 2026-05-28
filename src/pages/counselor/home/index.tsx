import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUser, clearAuth, updateUser } from '@/utils/auth'
import './index.scss'

interface AssessmentItem {
  id: string
  title: string
  scale: string
  status: 'active' | 'closed'
  responded: number
  total: number
  warningCount?: number
}

const overview = {
  warning: 5,    // 预警学生
  pending: 36,   // 未交人数
  thisWeek: 3,   // 本周新发
}

const stats = [
  { key: 'pub', label: '已发布', value: 12 },
  { key: 'recv', label: '回收答卷', value: 286 },
  { key: 'rate', label: '回收率', value: '78%' },
]

const recentList: AssessmentItem[] = [
  { id: '1', title: '2024 秋季心理健康普查', scale: 'SCL-90', status: 'active', responded: 86, total: 120, warningCount: 3 },
  { id: '2', title: '学业压力调查', scale: 'PSS-14', status: 'active', responded: 42, total: 80, warningCount: 1 },
  { id: '3', title: '新生适应性调查', scale: 'UPI', status: 'closed', responded: 158, total: 158, warningCount: 1 },
]

export default function CounselorHome() {
  const [user, setUser] = useState(getUser())

  useEffect(() => { setUser(getUser()) }, [])

  const onLogout = () => {
    clearAuth()
    Taro.reLaunch({ url: '/pages/login/index' })
  }

  // 选择微信头像
  const onChooseAvatar = (e: any) => {
    const url = e?.detail?.avatarUrl
    if (!url) return
    const next = updateUser({ avatar_url: url })
    if (next) setUser(next)
    Taro.showToast({ title: '头像已更新', icon: 'success' })
  }

  const onCreate = () => Taro.showToast({ title: '发布测评', icon: 'none' })
  const onViewWarning = () => Taro.showToast({ title: '查看预警', icon: 'none' })
  const onOpenDetail = (id: string) => Taro.showToast({ title: `测评 ${id}`, icon: 'none' })

  const initial = (user?.name || '老').charAt(0)

  return (
    <ScrollView scrollY className='cou'>
      {/* ===== 顶部 ===== */}
      <View className='cou__hero'>
        <View className='cou__hero-bg' />
        <View className='cou__hero-glow' />

        <View className='cou__brand'>
          <Text className='cou__brand-name'>MAIPsy</Text>
          <Text className='cou__brand-sub'>辅导员工作台</Text>
        </View>

        <View className='cou__greet'>
          <Button
            className='cou__avatar-btn'
            openType='chooseAvatar'
            onChooseAvatar={onChooseAvatar}
          >
            {user?.avatar_url ? (
              <Image className='cou__avatar-img' src={user.avatar_url} />
            ) : (
              <View className='cou__avatar'>
                <Text className='cou__avatar-text'>{initial}</Text>
              </View>
            )}
          </Button>
          <View className='cou__greet-info'>
            <Text className='cou__hello'>{user?.name || '老师'} 老师</Text>
            {user?.school_name && (
              <Text className='cou__school'>{user.school_name}</Text>
            )}
          </View>
        </View>
      </View>

      {/* ===== 重点提醒卡（预警） ===== */}
      {overview.warning > 0 && (
        <View className='cou__alert' onClick={onViewWarning}>
          <View className='cou__alert-left'>
            <View className='cou__alert-num'>
              <Text>{overview.warning}</Text>
            </View>
            <View className='cou__alert-info'>
              <Text className='cou__alert-title'>位学生需要关注</Text>
              <Text className='cou__alert-sub'>最近测评中出现预警结果</Text>
            </View>
          </View>
          <Text className='cou__alert-arrow'>›</Text>
        </View>
      )}

      {/* ===== 数据概览 ===== */}
      <View className='cou__stats'>
        {stats.map((s, i) => (
          <View key={s.key} className={`cou__stat stagger-${i + 1}`}>
            <Text className='cou__stat-value'>{s.value}</Text>
            <Text className='cou__stat-label'>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ===== 主操作 ===== */}
      <View className='cou__action' onClick={onCreate}>
        <View className='cou__action-icon'>
          <View className='cou__action-plus-h' />
          <View className='cou__action-plus-v' />
        </View>
        <View className='cou__action-body'>
          <Text className='cou__action-title'>发布新测评</Text>
          <Text className='cou__action-desc'>选择量表，一键推送给学生</Text>
        </View>
        <Text className='cou__action-arrow'>›</Text>
      </View>

      {/* ===== 最近测评 ===== */}
      <View className='cou__section'>
        <View className='cou__section-head'>
          <Text className='cou__section-title'>最近测评</Text>
          <Text className='cou__section-link'>全部</Text>
        </View>

        <View className='cou__list'>
          {recentList.map((a, i) => {
            const pct = Math.round((a.responded / a.total) * 100)
            return (
              <View
                key={a.id}
                className={`cou__card stagger-${i + 1}`}
                onClick={() => onOpenDetail(a.id)}
              >
                <View className='cou__card-head'>
                  <View className='cou__card-info'>
                    <View className='cou__card-tags'>
                      <View className='cou__card-scale'><Text>{a.scale}</Text></View>
                      <View className={`cou__card-status cou__card-status--${a.status}`}>
                        <Text>{a.status === 'active' ? '进行中' : '已结束'}</Text>
                      </View>
                    </View>
                    <Text className='cou__card-title'>{a.title}</Text>
                  </View>
                  {a.warningCount && a.warningCount > 0 && (
                    <View className='cou__card-warn'>
                      <Text>{a.warningCount} 预警</Text>
                    </View>
                  )}
                </View>

                <View className='cou__progress'>
                  <View className='cou__progress-track'>
                    <View
                      className='cou__progress-fill'
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                  <View className='cou__progress-meta'>
                    <Text className='cou__progress-text'>
                      <Text className='cou__progress-num'>{a.responded}</Text>
                      <Text className='cou__progress-total'> / {a.total}</Text>
                    </Text>
                    <Text className='cou__progress-pct'>{pct}%</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View className='cou__logout' onClick={onLogout}>
        <Text>退出登录</Text>
      </View>
    </ScrollView>
  )
}
