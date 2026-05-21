import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Question, getAssessmentDetail, submitAssessment } from '../../utils/api'
import './index.scss'

interface SurveyData {
  uid: string
  title: string
  scaleName: string
  questionCount: number
  questions: Question[]
}

export default function Survey() {
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useLoad((params) => {
    const uid = params.uid as string
    if (!uid) {
      Taro.showToast({ title: '缺少测评ID', icon: 'none' })
      setLoading(false)
      return
    }
    getAssessmentDetail(uid)
      .then((res) => {
        if (res.code === 0) {
          const d = res.data
          setSurvey({
            uid: d.assessment.uid,
            title: d.assessment.title,
            scaleName: d.assessment.scale_name,
            questionCount: d.assessment.question_count,
            questions: d.questions,
          })
        } else {
          Taro.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      })
      .catch(() => {
        Taro.showToast({ title: '网络错误', icon: 'none' })
      })
      .finally(() => setLoading(false))
  })

  const handleSelect = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }))
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = survey ? survey.questions.length : 0
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0
  const allAnswered = answeredCount === totalCount && totalCount > 0

  const handleSubmit = async () => {
    if (!allAnswered || !survey) return
    setSubmitting(true)

    const studentName = Taro.getStorageSync('studentName') || '匿名'
    const submitAnswers = Object.entries(answers).map(([qId, score]) => ({
      question_id: Number(qId),
      score,
    }))

    try {
      const res = await submitAssessment(survey.uid, studentName, submitAnswers)
      if (res.code === 0) {
        const d = res.data
        const levelText = d.result_label || d.result_level
        const summary = '本次自测已完成，感谢你认真作答。你的结果已安全记录。'
        const suggestion = d.is_warning
          ? '建议与辅导员或心理老师沟通，关注自身状态。'
          : '状态良好，继续保持健康的生活方式。'
        Taro.navigateTo({
          url: `/pages/result/index?level=${d.result_level}&levelText=${encodeURIComponent(levelText)}&summary=${encodeURIComponent(summary)}&suggestion=${encodeURIComponent(suggestion)}&score=${d.total_score}`
        })
      } else {
        Taro.showToast({ title: res.msg || '提交失败', icon: 'none' })
      }
    } catch (err) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    }
    setSubmitting(false)
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
      {/* 顶部进度条 */}
      <View className='survey__topbar'>
        <View className='survey__back' onClick={() => Taro.navigateBack()}>
          <Text className='survey__back-text'>‹ 返回</Text>
        </View>
        <Text className='survey__topbar-title'>{survey.title}</Text>
        <Text className='survey__topbar-count'>{answeredCount}/{totalCount}</Text>
      </View>
      <View className='survey__progress-bar'>
        <View className='survey__progress-fill' style={{ width: `${progress}%` }} />
      </View>

      <ScrollView scrollY className='survey__scroll'>
        <View className='survey__scroll-inner'>

          {/* 说明卡片 */}
          <View className='s-card s-card--info'>
            <View className='s-card__title-row'>
              <Text className='s-card__title'>📋 {survey.title}</Text>
            </View>
            <Text className='s-card__desc'>{survey.scaleName} · 请根据实际情况如实作答</Text>
            <View className='s-card__meta-row'>
              <Text className='s-card__meta'>共 {totalCount} 道题</Text>
            </View>
          </View>

          {/* 每道题 */}
          {survey.questions.map((q) => {
            const selected = answers[q.id]
            const answered = selected !== undefined
            return (
              <View key={q.id} className={`s-card ${answered ? 's-card--answered' : ''}`}>
                {/* 题号标题行 */}
                <View className='s-card__title-row'>
                  <View className={`s-card__num ${answered ? 's-card__num--done' : ''}`}>
                    <Text className='s-card__num-text'>{answered ? '✓' : q.seq}</Text>
                  </View>
                  <Text className='s-card__title'>{q.content}</Text>
                </View>

                {/* 选项区 */}
                <View className='s-card__options-box'>
                  <View className='s-card__options-inner'>
                    {q.options.map((opt) => (
                      <View
                        key={opt.score}
                        className={`s-option ${selected === opt.score ? 's-option--selected' : ''}`}
                        onClick={() => handleSelect(q.id, opt.score)}
                      >
                        <View className='s-option__dot' />
                        <Text className='s-option__label'>{opt.label}</Text>
                        {selected === opt.score && (
                          <View className='s-option__check'>
                            <Text className='s-option__check-text'>✓</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )
          })}

          {/* 提交卡片 */}
          <View className='s-card s-card--submit'>
            <View
              className={`s-submit ${!allAnswered || submitting ? 's-submit--disabled' : ''}`}
              onClick={!submitting ? handleSubmit : undefined}
            >
              <Text className='s-submit__text'>
                {submitting ? '提交中...' : allAnswered ? '提交并查看结果 →' : `还有 ${totalCount - answeredCount} 题未作答`}
              </Text>
            </View>
            <Text className='s-submit__hint'>🔒 结果仅用于心理健康评估，数据加密保存</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}
