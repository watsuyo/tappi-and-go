const express = require('express')
const line = require('@line/bot-sdk')
const PORT = process.env.PORT || 3000
require('dotenv').config()

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
  const replyTextMessage = (type, message) => {
    client.replyMessage(event.replyToken, {
      type: type,
      text: message
    })
  }
  const replyButtonMessage = (type, actions, imageUrl, title, text) => {
    client.replyMessage(event.replyToken, {
      type: type,
      altText: 'this is a buttons template',
      template: {
        type: 'buttons',
        actions: actions,
        thumbnailImageUrl: imageUrl,
        title: title,
        text: text
      }
    })
  }
  if (event.type === 'follow')
    replyTextMessage(
      'text',
      '友達登録ありがとうございます😄 タピオカを注文する際は、"注文する" と話しかけてください！'
    )

  // テキストメッセージ以外は既読無視
  if (event.type !== 'message' || event.message.type !== 'text')
    return Promise.resolve(null)

  // 注文する
  if (messegeText === '注文する')
    replyButtonMessage(
      'template',
      [
        {
          type: 'message',
          label: '表参道店',
          text: '表参道店'
        },
        {
          type: 'message',
          label: '渋谷店',
          text: '渋谷店'
        },
        {
          type: 'message',
          label: '六本木店',
          text: '六本木店'
        }
      ],
      'https://uploader.xzy.pw/upload/20190907165747_6130567045.jpg',
      'ご注文可能な店舗',
      '以下から選択してください'
    )
  if (['表参道店', '渋谷店', '六本木店'].includes(messegeText))
    replyTextMessage(
      'text',
      'ドリンクの種類を以下からお選びください。 ミルクティー、抹茶ミルク、ほうじ茶、カフェラテ'
    )
  if (
    ['ミルクティー', '抹茶ミルク', 'ほうじ茶', 'カフェラテ'].includes(
      messegeText
    )
  )
    replyTextMessage(
      'text',
      'ドリンクサイズ選択 以下からお選びください。 Mサイズ Lサイズ'
    )
  if (['Mサイズ', 'Lサイズ'].includes(messegeText))
    replyTextMessage(
      'text',
      '甘さ選択 以下から選択してください。 無糖 ひかえめ 甘め'
    )
  if (['無糖', 'ひかえめ', '甘め'].includes(messegeText))
    replyTextMessage(
      'text',
      '冷たさ調整 以下から選択してください。 氷あり 氷なし'
    )

  if (['氷あり', '氷なし'].includes(messegeText))
    replyTextMessage(
      'text',
      '有料でオプションを付けることができます。 以下から選択してください。 タピオカ増量(+100) 特に必要なし'
    )
  if (['タピオカ増量(+100)', '特に必要なし'].includes(messegeText))
    replyTextMessage('text', 'ご注文内容確認')
}

app.listen(PORT)
console.log(`Server running at ${PORT}`)
