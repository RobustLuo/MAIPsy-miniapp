import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { AssignedSurvey } from '../../utils/api'
import './index.scss'

export default function Index() {
  const [surveys, setSurveys] = useState<AssignedSurvey[]>([])
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    // Mock 数据（后端接入前使用）
    setStudentName('张同学')
    setSurveys([
      {
        id: 'phq9-001',
        title: '近期状态自测',
        description: '了解你近两周的情绪与精力状况，共 9 题，请如实作答。',
        estimatedMinutes: 3,
        deadline: '05-25',
        publishedBy: '王老师',
        status: 'pending',
      },
      {
        id: 'gad7-001',
        title: '压力与情绪自测',
        description: '了解你近两周的压力感受与情绪变化，共 7 题。',
        estimatedMinutes: 2,
        deadline: '05-25',
        publishedBy: '王老师',
        status: 'pending',
      },
      {
        id: 'sds-001',
        title: '心理健康年度自测',
        description: '上学期测评，已提交。',
        estimatedMinutes: 5,
        deadline: '04-10',
        publishedBy: '李老师',
        status: 'completed',
      },
    ])
    setLoading(false)
  })

  const handleEnter = (survey: AssignedSurvey) => {
    if (survey.status === 'completed') {
      Taro.showToast({ title: '该测评已完成', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/survey/index?id=${survey.id}&title=${encodeURIComponent(survey.title)}`
    })
  }

  const pendingList = surveys.filter(s => s.status === 'pending')
  const doneList = surveys.filter(s => s.status === 'completed')

  return (
    <View className='home'>
      <View className='home__glow' />

      {/* 顶部 */}
      <View className='home__header'>
        <View className='home__header-left'>
          <View className='home__logo'>
            <Text className='home__logo-icon'>♡</Text>
          </View>
          <View>
            <Text className='home__brand'>MAIPsy</Text>
            <Text className='home__tagline'>心理健康测评</Text>
          </View>
        </View>
        {studentName ? (
          <Text className='home__name'>你好，{studentName}</Text>
        ) : null}
      </View>

      {loading ? (
        <View className='home__loading'>
          <Text className='home__loading-text'>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY className='home__scroll'>
          <View className='home__scroll-inner'>
          {/* 待完成 */}
          {pendingList.length > 0 ? (
            <View className='home__section'>
              <View className='home__section-title-row'>
                <Text className='home__section-title'>待完成</Text>
                <View className='home__badge'>
                  <Text className='home__badge-text'>{pendingList.length}</Text>
                </View>
              </View>
              {pendingList.map(s => (
                <View key={s.id} className='home__card home__card--pending' onClick={() => handleEnter(s)}>
                  <View className='home__card-top'>
                    <Text className='home__card-title'>{s.title}</Text>
                    <View className='home__card-arrow'>
                      <Text className='home__card-arrow-text'>→</Text>
                    </View>
                  </View>
                  <Text className='home__card-desc'>{s.description}</Text>
                  <View className='home__card-meta'>
                    <Text className='home__card-meta-text'>⏱ 约 {s.estimatedMinutes} 分钟</Text>
                    <Text className='home__card-meta-text'>👤 {s.publishedBy}</Text>
                    <Text className='home__card-deadline'>截止 {s.deadline}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className='home__empty'>
              <Text className='home__empty-icon'>🎉</Text>
              <Text className='home__empty-text'>暂无待完成的测评</Text>
              <Text className='home__empty-sub'>当辅导员发布新测评后，会在这里显示</Text>
            </View>
          )}

          {/* 已完成 */}
          {doneList.length > 0 && (
            <View className='home__section'>
              <Text className='home__section-title'>已完成</Text>
              {doneList.map(s => (
                <View key={s.id} className='home__card home__card--done'>
                  <View className='home__card-top'>
                    <Text className='home__card-title home__card-title--done'>{s.title}</Text>
                    <Text className='home__card-done-tag'>✓ 已完成</Text>
                  </View>
                  <Text className='home__card-meta-text'>👤 {s.publishedBy}</Text>
                </View>
              ))}
            </View>
          )}

          <View className='home__footer'>
            <Text className='home__footer-text'>🔒 数据加密传输，仅用于心理健康评估</Text>
          </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
