const Discord = require('discord.js')
const fs = require('fs')
const _ = require('lodash')
const { resolve } = require('path')
const util = require('util')

const bot = new Discord.Client({
  disableEveryone: true,
  disabledEvents: ['TYPING_START']
})

const TOKEN = process.env.DISCORD_TOKEN
console.log(process.env)

bot.login(TOKEN)
const readFile = util.promisify(fs.readFile)

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  // console.log(bot)
})

console.log('listening for messages')

/** channels in the chat */
const channels = {
  'general-millis': 'general',
  'bot-shit': 'bot',
  'rules': 'rules',
  'dank-maymays': 'dank',
  'boomers-only': 'boomers'
}

/** returns parsed message */
const msgParse = (msg) => {
  return {
    data: {
      isBot: msg.author.bot,
      user: msg.author.username,
      msg: msg.content,
      channel: msg.channel.name,
    },
    shit: msg
  }
}

const canIBeAdmin = (msg) => {
  const words = 'can i be admin'
  return msg.includes(words)
}

// "sounds hyper": { 
//   "txt": "I know",
//   "channel": "all",
//   "type": "@"
// },
// "jonah is gay": { 
//   "txt": "I know",
//   "channel": "all",
//   "type": "@"
// }

const auto_reply = async (msg) => {
  let data = await update_words() // grab new word mapping of responses
  Object.assign(replies, JSON.parse(data))
  if (msg.data.msg.toLowerCase().includes('add')) {
    // add this to the mapping
    let cleaned = msg.data.msg.toLowerCase().replace('add', '').split(',')
    // if ()
    console.log('cleaned', cleaned)
    if (cleaned.length >= 2) {
      let command = cleaned[0].trim()
      let response = cleaned[1].trim()
      Object.assign(replies, { [command]: response })
      console.log('added new command ', { [command]: response })
      console.log('current replies', _.entries(replies))
      return
    }
  }
  console.log('current replies', _.entries(replies))
  if (_.some(_.keys(replies), k => msg.data.msg.toLowerCase().includes(k)) && _.find(_.keys(replies), (k) => msg.data.msg.includes(k))) {
    // use the programmed reply

    console.log(_.find(_.keys(replies), (k, v) => msg.data.msg.includes(k)))
    msg.shit.reply(replies[_.find(_.keys(replies), (k, v) => msg.data.msg.includes(k))])
  }

}

let replies = {}
const update_words = async () => {
  return readFile('update.json', 'utf8')
}


bot.on('message', msg => {
  try {
    const message = msgParse(msg)
    console.log('message recieved: \n', message.data)
    if (message.data.isBot) return
    if (message.data.msg == 'reset') { replies = {}; msg.channel.send("dedo is RESET") }
    auto_reply(message)
  }
  catch (err) {
    console.log(err)
  }
})