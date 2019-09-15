const express = require('express')
const line = require('@line/bot-sdk')
const PORT = process.env.PORT || 3000

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

const app = express()
app.get('/', (req, res) => {
  res.send('Hello! LINE Bot World!')
})

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events[0])
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result))
})

const client = new line.Client(config)

const handleEvent = event => {
  const messegeText = event.message && event.message.text
  const replyMessage = (type, message) => {
    client.replyMessage(event.replyToken, {
      type: type,
      text: message
    })
  }
  if (event.type === 'follow')
    replyMessage(
      'text',
      '友達登録ありがとうございます😄 タピオカを注文する際は、"注文する" と話しかけてください！'
    )

  // テキストメッセージ以外は既読無視
  if (event.type !== 'message' || event.message.type !== 'text')
    return Promise.resolve(null)
  if (messegeText === '注文する')
    replyMessage('text', '店舗をお選びください。表参道店、渋谷店、六本木店')
  if (['表参道店', '渋谷店', '六本木店'].includes(messegeText))
    replyMessage(
      'text',
      'ドリンクの種類を以下からお選びください。 ミルクティー、抹茶ミルク、ほうじ茶、カフェラテ'
    )
  if (
    ['ミルクティー', '抹茶ミルク', 'ほうじ茶', 'カフェラテ'].includes(
      messegeText
    )
  )
    replyMessage(
      'text',
      'ドリンクサイズ選択 以下からお選びください。 Mサイズ Lサイズ'
    )
  if (['Mサイズ', 'Lサイズ'].includes(messegeText))
    replyMessage(
      'text',
      '甘さ選択 以下から選択してください。 無糖 ひかえめ 甘め'
    )
  if (['無糖', 'ひかえめ', '甘め'].includes(messegeText))
    replyMessage('text', '冷たさ調整 以下から選択してください。 氷あり 氷なし')

  if (['氷あり', '氷なし'].includes(messegeText))
    replyMessage(
      'text',
      '有料でオプションを付けることができます。 以下から選択してください。 タピオカ増量(+100) 特に必要なし'
    )
  if (['タピオカ増量(+100)', '特に必要なし'].includes(messegeText))
    replyMessage('text', 'ご注文内容確認')
}

app.listen(PORT)
console.log(`Server running at ${PORT}`)
