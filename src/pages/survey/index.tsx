import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { SurveyInfo } from '../../utils/api'
import './index.scss'

export default function Survey() {
  const [survey, setSurvey] = useState<SurveyInfo | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useLoad((params) => {
    // Mock 数据（后端接入前使用）
    const mockSurveys: Record<string, SurveyInfo> = {
      'phq9-001': {
        id: 'phq9-001',
        title: '近期状态自测',
        description: '请根据过去两周的感受，选择最符合你实际情况的选项。没有对错，如实作答即可。',
        estimatedMinutes: 3,
        questions: [
          { id: 'q1', index: 1, text: '做事时感到没什么劲头或兴趣', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q2', index: 2, text: '心情感到不太好、情绪低落', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q3', index: 3, text: '入睡困难、睡不安稳或睡眠过多', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q4', index: 4, text: '感觉疲倦或没有活力', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q5', index: 5, text: '食欲不振或吃太多', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q6', index: 6, text: '对自己评价偏低，容易责怪自己', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q7', index: 7, text: '对事物专注有困难，例如阅读报纸或看电视时', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q8', index: 8, text: '动作或说话速度缓慢到别人已经察觉，或者相反，烦躁或坐立不安', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q9', index: 9, text: '有时感到生活很困难，希望能逃离现在的状态', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '一半以上的天数' }, { value: 3, label: '几乎每天' }] },
        ]
      },
      'gad7-001': {
        id: 'gad7-001',
        title: '压力与情绪自测',
        description: '请根据过去两周的感受，选择最符合你实际情况的选项。没有对错，如实作答即可。',
        estimatedMinutes: 2,
        questions: [
          { id: 'q1', index: 1, text: '感到紧张、焦虑或烦躁', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q2', index: 2, text: '不能停止或控制担心', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q3', index: 3, text: '对各种各样的事情担忧过多', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q4', index: 4, text: '很难放松下来', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q5', index: 5, text: '由于不安而无法静坐', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q6', index: 6, text: '变得容易烦恼或急躁', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
          { id: 'q7', index: 7, text: '感到似乎将有可怕的事情发生而害怕', options: [{ value: 0, label: '完全不会' }, { value: 1, label: '好几天' }, { value: 2, label: '超过一半的天数' }, { value: 3, label: '几乎每天' }] },
        ]
      }
    }
    const data = mockSurveys[params.id as string]
    if (data) {
      setSurvey(data)
    } else {
      Taro.showToast({ title: '量表不存在', icon: 'none' })
    }
    setLoading(false)
  })

  const handleSelect = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = survey?.questions.length ?? 0
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0
  const allAnswered = answeredCount === totalCount && totalCount > 0

  const handleSubmit = () => {
    if (!allAnswered) {
      Taro.showToast({ title: `还有 ${totalCount - answeredCount} 题未作答`, icon: 'none' })
      return
    }
    if (!survey) return
    setSubmitting(true)
    // Mock 结果：根据总分模拟风险等级
    const total = Object.values(answers).reduce((s, v) => s + v, 0)
    const level = total <= 4 ? 'low' : total <= 9 ? 'mild' : total <= 14 ? 'moderate' : 'severe'
    const levelText = total <= 4 ? '整体状态良好' : total <= 9 ? '近期有些波动' : total <= 14 ? '需要多一些关注' : '需要支持与陪伴'
    const summary = `本次自测已完成，感谢你认真作答。你的结果已安全记录，辅导员会在合适时候与你沟通。`
    const suggestion = level === 'low'
      ? '状态良好，继续保持健康的生活方式，定期关注自身情绪变化。'
      : level === 'mild'
      ? '建议与辅导员或朋友多沟通，适当进行放松训练，如有需要可预约心理咨询。'
      : level === 'moderate'
      ? '建议尽快预约心理老师进行一对一访谈，并告知辅导员你目前的状态。'
      : '请立即联系辅导员或心理老师，如有紧急情况请拨打心理援助热线 400-161-9995。'
    setTimeout(() => {
      setSubmitting(false)
      Taro.navigateTo({
        url: `/pages/result/index?level=${level}&levelText=${encodeURIComponent(levelText)}&summary=${encodeURIComponent(summary)}&suggestion=${encodeURIComponent(suggestion)}&score=${total}`
      })
    }, 800)
  }

  if (loading) {
    return (
      <View className='survey-loading'>
        <Text className='survey-loading__text'>加载中...</Text>
      </View>
    )
  }

  if (!survey) return null

  return (
    <View className='survey'>
      {/* 顶部进度栏 */}
      <View className='survey__header'>
        <View className='survey__progress-row'>
          <Text className='survey__progress-text'>{answeredCount} / {totalCount} 题</Text>
          <Text className='survey__progress-pct'>{Math.round(progress)}%</Text>
        </View>
        <View className='survey__progress-bar'>
          <View className='survey__progress-fill' style={{ width: `${progress}%` }} />
        </View>
      </View>

      {/* 量表标题 */}
      <View className='survey__title-section'>
        <Text className='survey__title'>{survey.title}</Text>
        <Text className='survey__desc'>{survey.description}</Text>
        <View className='survey__meta'>
          <Text className='survey__meta-text'>⏱ 约 {survey.estimatedMinutes} 分钟</Text>
          <Text className='survey__meta-text'>📋 {totalCount} 道题</Text>
        </View>
      </View>

      {/* 题目列表 */}
      <ScrollView scrollY className='survey__scroll'>
        {survey.questions.map((q) => {
          const selected = answers[q.id]
          return (
            <View key={q.id} className='survey__question'>
              <View className='survey__q-header'>
                <View className={`survey__q-num ${selected !== undefined ? 'survey__q-num--done' : ''}`}>
                  <Text className='survey__q-num-text'>{q.index}</Text>
                </View>
                <Text className='survey__q-text'>{q.text}</Text>
              </View>

              <View className='survey__options'>
                {q.options.map((opt) => (
                  <View
                    key={opt.value}
                    className={`survey__option ${selected === opt.value ? 'survey__option--selected' : ''}`}
                    onClick={() => handleSelect(q.id, opt.value)}
                  >
                    <View className={`survey__option-dot ${selected === opt.value ? 'survey__option-dot--selected' : ''}`} />
                    <Text className='survey__option-label'>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        {/* 提交按钮 */}
        <View className='survey__submit-wrap'>
          <View
            className={`survey__submit ${!allAnswered || submitting ? 'survey__submit--disabled' : ''}`}
            onClick={!submitting ? handleSubmit : undefined}
          >
            <Text className='survey__submit-text'>
              {submitting ? '提交中...' : allAnswered ? '提交测评' : `还有 ${totalCount - answeredCount} 题未作答`}
            </Text>
          </View>
          <Text className='survey__submit-hint'>提交后将由 AI 生成分析报告</Text>
        </View>
      </ScrollView>
    </View>
  )
}
