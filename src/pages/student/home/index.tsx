import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Input, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUser, clearAuth, updateUser } from '@/utils/auth'
import './index.scss'

type Status = 'normal' | 'attention' | 'warning'

interface Assessment {
  id: string
  title: string
  scaleName: string
  deadline?: string
  questionCount?: number
  status?: Status
  aiInsight?: string
}

const pendingList: Assessment[] = [
  { id: '1', title: '心理健康普查', scaleName: 'SCL-90', deadline: '12-15', questionCount: 90 },
  { id: '2', title: '学业压力调查', scaleName: 'PSS-14', deadline: '12-20', questionCount: 14 },
]

const completedList: Assessment[] = [
  { id: '3', title: '新生心理适应调查', scaleName: 'UPI', status: 'normal', aiInsight: '总体状态不错，继续保持' },
  { id: '4', title: '焦虑情绪筛查', scaleName: 'GAD-7', status: 'attention', aiInsight: '近期压力略高，多关注自己' },
]

const statusMap: Record<Status, { label: string; cls: string }> = {
  normal: { label: '正常', cls: 'home__badge--normal' },
  attention: { label: '关注', cls: 'home__badge--attention' },
  warning: { label: '预警', cls: 'home__badge--warning' },
}

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深啦'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const suggestions = [
  '聊聊今天的心情',
  '最近压力有点大',
  '睡眠不太好',
  '人际关系困扰',
]

export default function StudentHome() {
  const [user, setUser] = useState(getUser())
  const [chatInput, setChatInput] = useState('')

  useEffect(() => { setUser(getUser()) }, [])

  const onLogout = () => {
    clearAuth()
    Taro.reLaunch({ url: '/pages/login/index' })
  }

  const onChooseAvatar = (e: any) => {
    const url = e?.detail?.avatarUrl
    if (!url) return
    const next = updateUser({ avatar_url: url })
    if (next) setUser(next)
  }

  const onStartChat = (msg?: string) => {
    const m = msg || chatInput.trim()
    if (!m) {
      Taro.showToast({ title: '说点什么吧', icon: 'none' })
      return
    }
    Taro.showToast({ title: `发送: ${m}`, icon: 'none' })
    setChatInput('')
  }

  const onDoSurvey = (id: string) => Taro.showToast({ title: `测评 ${id}`, icon: 'none' })
  const onAiSurvey = (id: string) => Taro.showToast({ title: `AI 陪做 ${id}`, icon: 'none' })
  const onViewInsight = (id: string) => Taro.showToast({ title: `AI 解读 ${id}`, icon: 'none' })

  const hasPending = pendingList.length > 0

  return (
    <View className='home'>
      <ScrollView scrollY className='home__scroll'>
        {/* ===== 顶部 ===== */}
        <View className='home__hero'>
          <View className='home__top'>
            <View className='home__brand'>
              <View className='home__brand-mark' />
              <Text className='home__brand-name'>MAIPsy</Text>
            </View>
            <Button
              className='home__user-btn'
              openType='chooseAvatar'
              onChooseAvatar={onChooseAvatar}
            >
              {user?.avatar_url ? (
                <Image className='home__user-avatar' src={user.avatar_url} />
              ) : (
                <View className='home__user-avatar home__user-avatar--ph' />
              )}
            </Button>
          </View>

          <Text className='home__greeting'>{getTimeGreeting()}</Text>
          <Text className='home__name'>{user?.name || '同学'}</Text>
        </View>

        {/* ===== 麦小理介绍卡 ===== */}
        <View className='home__intro'>
          <View className='home__intro-mark' />
          <View className='home__intro-body'>
            <View className='home__intro-row'>
              <Text className='home__intro-name'>麦小理</Text>
              <View className='home__intro-status'>
                <View className='home__intro-dot' />
                <Text>在线</Text>
              </View>
            </View>
            <Text className='home__intro-desc'>
              你的心理小伙伴，有想说的都可以告诉我
            </Text>
          </View>
        </View>

        {/* ===== AI 引导 / 待办提醒 ===== */}
        {hasPending && (
          <View className='home__remind'>
            <View className='home__remind-num'>
              <Text>{pendingList.length}</Text>
            </View>
            <View className='home__remind-body'>
              <Text className='home__remind-title'>有 {pendingList.length} 个测评待完成</Text>
              <Text className='home__remind-desc'>用对话的方式做，更轻松</Text>
            </View>
            <View className='home__remind-btn' onClick={() => onAiSurvey(pendingList[0].id)}>
              <Text>开始</Text>
            </View>
          </View>
        )}

        {/* ===== 推荐话题 ===== */}
        <View className='home__topics'>
          <Text className='home__topics-title'>聊点什么</Text>
          <View className='home__topics-list'>
            {suggestions.map((s, i) => (
              <View key={i} className='home__topic' onClick={() => onStartChat(s)}>
                <Text>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== 测评 ===== */}
        <View className='home__assess'>
          <View className='home__section'>
            <View className='home__section-head'>
              <Text className='home__section-title'>待完成</Text>
              <Text className='home__section-count'>{pendingList.length}</Text>
            </View>

            <View className='home__list'>
              {pendingList.map((a) => (
                <View key={a.id} className='home__card'>
                  <View className='home__card-head' onClick={() => onDoSurvey(a.id)}>
                    <View className='home__card-body'>
                      <Text className='home__card-scale'>{a.scaleName}</Text>
                      <Text className='home__card-title'>{a.title}</Text>
                      <View className='home__card-meta'>
                        {a.deadline && <Text className='home__card-meta-item'>截止 {a.deadline}</Text>}
                        {a.questionCount && <Text className='home__card-meta-item'>{a.questionCount} 题</Text>}
                      </View>
                    </View>
                  </View>
                  <View className='home__card-actions'>
                    <View className='home__card-btn home__card-btn--ai' onClick={() => onAiSurvey(a.id)}>
                      <Text>AI 陪我做</Text>
                    </View>
                    <View className='home__card-btn home__card-btn--ghost' onClick={() => onDoSurvey(a.id)}>
                      <Text>自己做</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='home__section'>
            <View className='home__section-head'>
              <Text className='home__section-title'>已完成</Text>
            </View>

            <View className='home__list'>
              {completedList.map((a) => (
                <View
                  key={a.id}
                  className='home__card home__card--done'
                  onClick={() => onViewInsight(a.id)}
                >
                  <View className='home__card-head'>
                    <View className='home__card-body'>
                      <View className='home__card-row'>
                        <Text className='home__card-scale'>{a.scaleName}</Text>
                        {a.status && (
                          <View className={`home__badge ${statusMap[a.status].cls}`}>
                            <Text>{statusMap[a.status].label}</Text>
                          </View>
                        )}
                      </View>
                      <Text className='home__card-title'>{a.title}</Text>
                      {a.aiInsight && (
                        <Text className='home__insight'>{a.aiInsight}</Text>
                      )}
                    </View>
                    <Text className='home__card-arrow'>›</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='home__logout' onClick={onLogout}>
            <Text>退出登录</Text>
          </View>
        </View>

        <View className='home__footer-space' />
      </ScrollView>

      {/* ===== 底部输入栏 ===== */}
      <View className='home__inputbar'>
        <View className='home__input-wrap'>
          <Input
            className='home__input'
            placeholder='告诉麦小理你在想什么…'
            placeholderClass='home__input-ph'
            value={chatInput}
            onInput={(e) => setChatInput(e.detail.value)}
            confirmType='send'
            onConfirm={() => onStartChat()}
          />
        </View>
        <View
          className={`home__send ${chatInput.trim() ? 'is-active' : ''}`}
          onClick={() => onStartChat()}
        >
          <Text>↑</Text>
        </View>
      </View>
    </View>
  )
}
