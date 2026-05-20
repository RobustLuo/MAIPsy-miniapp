import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { AssignedSurvey, getAssessmentList } from '../../utils/api'
import './index.scss'

export default function Index() {
  const [surveys, setSurveys] = useState<AssignedSurvey[]>([])
  const [studentName, setStudentName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [scrollTop, setScrollTop] = useState(0)

  useLoad(() => {
    setStudentName(Taro.getStorageSync('studentName') || '同学')
    // 拉取所有进行中的测评（公开接口，无需登录）
    getAssessmentList()
      .then((res) => {
        if (res.code === 0) {
          setSurveys(res.data.assessments || [])
        }
      })
      .catch((err) => {
        console.error('获取测评列表失败', err)
      })
      .finally(() => setLoading(false))
  })

  const handleChooseAvatar = (e: any) => setAvatarUrl(e.detail.avatarUrl)
  const handleScroll = (e: any) => setScrollTop(e.detail.scrollTop)

  const handleEnter = (s: AssignedSurvey) => {
    if (s.status === 'closed') return Taro.showToast({ title: '该测评已关闭', icon: 'none' })
    Taro.navigateTo({ url: `/pages/survey/index?uid=${s.uid}&title=${encodeURIComponent(s.title)}` })
  }

  // 扫码进入测评
  const handleScan = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        const text = res.result || ''
        const match = text.match(/(?:survey\/|uid=)(ASM-[A-Z0-9]+)/i) || text.match(/(ASM-[A-Z0-9]+)/i)
        if (match) {
          Taro.navigateTo({ url: `/pages/survey/index?uid=${match[1]}` })
        } else {
          Taro.showToast({ title: '未识别到有效测评', icon: 'none' })
        }
      },
    })
  }

  // 手动输入测评码
  const handleManualInput = () => {
    (Taro.showModal as any)({
      title: '输入测评码',
      editable: true,
      placeholderText: '例：ASM-XXXXXXXX',
      success: (res: any) => {
        if (res.confirm && res.content) {
          const uid = res.content.trim().toUpperCase()
          if (uid) {
            Taro.navigateTo({ url: `/pages/survey/index?uid=${uid}` })
          }
        }
      },
    })
  }

  const pendingList = surveys.filter(s => s.status === 'active')
  const doneList = surveys.filter(s => s.status === 'closed')

  // Large title -> compact title transition
  const titleProgress = Math.min(scrollTop / 60, 1)

  return (
    <View className='page'>
      {/* 紧凑顶栏（滚动后显现） */}
      <View className='nav' style={{ opacity: titleProgress }}>
        <Text className='nav__title'>测评</Text>
      </View>

      {loading ? (
        <View className='page__loading'><Text className='page__loading-text'>加载中…</Text></View>
      ) : (
        <ScrollView scrollY className='page__scroll' onScroll={handleScroll}>

          {/* Large Title */}
          <View className='hd' style={{ opacity: 1 - titleProgress }}>
            <Text className='hd__date'>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</Text>
            <View className='hd__row'>
              <Text className='hd__title'>测评</Text>
              <Button className='hd__avatar-btn' openType='chooseAvatar' onChooseAvatar={handleChooseAvatar}>
                {avatarUrl
                  ? <Image className='hd__avatar' src={avatarUrl} mode='aspectFill' />
                  : <View className='hd__avatar hd__avatar--empty'>
                      <Text className='hd__avatar-text'>{studentName ? studentName[0] : '我'}</Text>
                    </View>}
              </Button>
            </View>
            <Text className='hd__greet'>你好，{studentName || '同学'}</Text>
          </View>

          {/* Stats summary */}
          <View className='summary'>
            <View className='summary__item'>
              <Text className='summary__num summary__num--blue'>{pendingList.length}</Text>
              <Text className='summary__label'>待完成</Text>
            </View>
            <View className='summary__item'>
              <Text className='summary__num summary__num--green'>{doneList.length}</Text>
              <Text className='summary__label'>已完成</Text>
            </View>
            <View className='summary__item'>
              <Text className='summary__num'>{surveys.length}</Text>
              <Text className='summary__label'>累计</Text>
            </View>
          </View>

          {/* 入口 */}
          <View className='section'>
            <View className='list'>
              <View className='row row--divider' onClick={handleScan}>
                <View className='row__icon row__icon--blue'>
                  <View className='row__icon-glyph row__icon-glyph--doc' />
                </View>
                <View className='row__main'>
                  <Text className='row__title'>扫码参与测评</Text>
                  <Text className='row__sub'>扫描辅导员分享的测评二维码</Text>
                </View>
                <Text className='row__chevron'>›</Text>
              </View>
              <View className='row' onClick={handleManualInput}>
                <View className='row__icon row__icon--blue'>
                  <View className='row__icon-glyph row__icon-glyph--doc' />
                </View>
                <View className='row__main'>
                  <Text className='row__title'>输入测评码</Text>
                  <Text className='row__sub'>手动输入测评码参与测评</Text>
                </View>
                <Text className='row__chevron'>›</Text>
              </View>
            </View>
          </View>

          {/* 待完成 Section */}
          {pendingList.length > 0 && (
            <View className='section'>
              <Text className='section__title'>进行中</Text>
              <View className='list'>
                {pendingList.map((s, i) => (
                  <View
                    key={s.uid}
                    className={`row ${i < pendingList.length - 1 ? 'row--divider' : ''}`}
                    onClick={() => handleEnter(s)}
                  >
                    <View className='row__icon row__icon--blue'>
                      <View className='row__icon-glyph row__icon-glyph--doc' />
                    </View>
                    <View className='row__main'>
                      <Text className='row__title'>{s.title}</Text>
                      <Text className='row__sub'>{s.scale_name}</Text>
                      <Text className='row__caption'>{s.deadline ? `截止 ${s.deadline.slice(0, 10)}` : '长期有效'}</Text>
                    </View>
                    <Text className='row__chevron'>›</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 已完成 Section */}
          {doneList.length > 0 && (
            <View className='section'>
              <Text className='section__title'>已完成</Text>
              <View className='list'>
                {doneList.map((s, i) => (
                  <View key={s.uid} className={`row row--done ${i < doneList.length - 1 ? 'row--divider' : ''}`}>
                    <View className='row__icon row__icon--gray'>
                      <View className='row__icon-glyph row__icon-glyph--check' />
                    </View>
                    <View className='row__main'>
                      <Text className='row__title row__title--done'>{s.title}</Text>
                      <Text className='row__caption'>{s.scale_name}{s.class_name ? ` · ${s.class_name}` : ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text className='footer-note'>数据加密传输 · 仅用于心理健康评估</Text>
        </ScrollView>
      )}
    </View>
  )
}
