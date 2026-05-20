import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

type Level = 'low' | 'mild' | 'moderate' | 'severe'

const LEVEL_CONFIG: Record<Level, { label: string; color: string; bg: string; icon: string; tip: string }> = {
  low:      { label: '状态不错',   color: '#10b981', bg: 'rgba(16,185,129,0.10)', icon: '🌱', tip: '你目前的状态很好，继续保持规律作息和适当运动，有什么想聊的也可以随时找辅导员。' },
  mild:     { label: '需要关注',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '🌤', tip: '最近可能有些压力或情绪波动，这很正常。建议多和朋友或辅导员聊聊，也可以尝试放松练习。' },
  moderate: { label: '建议沟通',   color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: '⛅', tip: '你近期的状态需要一些额外关注。辅导员已收到提示，你也可以主动和老师预约聊聊，他们很乐意帮你。' },
  severe:   { label: '需要支持',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '🤝', tip: '你现在可能有些不容易，请记住你不是一个人。辅导员会尽快联系你，你也可以随时拨打学校心理援助热线。' },
}

interface ResultState {
  level: Level
  levelText: string
  summary: string
  suggestion: string
  score: number
}

export default function Result() {
  const [result, setResult] = useState<ResultState | null>(null)

  useLoad((params) => {
    setResult({
      level: (params.level as Level) || 'low',
      levelText: decodeURIComponent((params.levelText as string) || ''),
      summary: decodeURIComponent((params.summary as string) || ''),
      suggestion: decodeURIComponent((params.suggestion as string) || ''),
      score: Number(params.score) || 0,
    })
  })

  const handleContact = () => {
    Taro.showModal({
      title: '联系辅导员',
      content: '是否需要预约一次谈话？辅导员将在 24 小时内联系你。',
      confirmText: '是的',
      cancelText: '暂不需要',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已发送预约请求', icon: 'success' })
        }
      }
    })
  }

  const handleBack = () => {
    Taro.navigateTo({ url: '/pages/index/index' })
  }

  if (!result) return null

  const cfg = LEVEL_CONFIG[result.level]

  return (
    <View className='result'>
      <View className='result__glow' style={{ background: `radial-gradient(ellipse, ${cfg.color}22 0%, transparent 70%)` }} />

      {/* 状态卡 */}
      <View className='result__status-card' style={{ borderColor: cfg.color + '33' }}>
        <View className='result__icon-wrap' style={{ background: cfg.bg }}>
          <Text className='result__icon'>{cfg.icon}</Text>
        </View>
        <Text className='result__level' style={{ color: cfg.color }}>{cfg.label}</Text>
        <Text className='result__level-sub'>{result.levelText}</Text>
        <View className='result__score-row'>
          <Text className='result__score-label'>综合得分</Text>
          <Text className='result__score' style={{ color: cfg.color }}>{result.score}</Text>
        </View>
      </View>

      {/* 分析摘要 */}
      {result.summary ? (
        <View className='result__section'>
          <Text className='result__section-title'>🤖 AI 分析摘要</Text>
          <View className='result__section-body'>
            <Text className='result__section-text'>{result.summary}</Text>
          </View>
        </View>
      ) : null}

      {/* 建议 */}
      <View className='result__section'>
        <Text className='result__section-title'>💡 建议</Text>
        <View className='result__section-body'>
          <Text className='result__section-text'>{result.suggestion || cfg.tip}</Text>
        </View>
      </View>

      {/* 提示文字 */}
      <View className='result__notice'>
        <Text className='result__notice-text'>
          本测评结果仅供参考，不构成临床诊断。如有需要，请及时寻求专业支持。
        </Text>
      </View>

      {/* 按钮组 */}
      <View className='result__actions'>
        {(result.level === 'moderate' || result.level === 'severe') && (
          <View className='result__btn result__btn--primary' onClick={handleContact}>
            <Text className='result__btn-text'>联系辅导员</Text>
          </View>
        )}
        <View className='result__btn result__btn--secondary' onClick={handleBack}>
          <Text className='result__btn-text result__btn-text--secondary'>返回首页</Text>
        </View>
      </View>

      {/* 紧急求助 */}
      {result.level === 'severe' && (
        <View className='result__emergency'>
          <Text className='result__emergency-text'>
            🆘 心理援助热线：400-161-9995（24 小时）
          </Text>
        </View>
      )}
    </View>
  )
}
