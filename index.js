const Discord = require('discord.js')
const fs = require('fs')
const _ = require('lodash')
const { resolve } = require('path')
const { send } = require('process')
const util = require('util')
const emoji = require('./emoji.js')

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
  'general': 'general-millis',
  'bots': 'bot-shit',
  'rules': 'rules',
  'dank': 'dank-maymays',
  'boomers': 'boomers-only'
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
    send_message(msg.shit, replies[_.find(_.keys(replies), (k, v) => msg.data.msg.includes(k))], true)
  }

}

let replies = {}
const update_words = async () => {
  return readFile('update.json', 'utf8')
}


/** holds dedos status */
dedo_status = {
  active: true,
  fancy_text: false,
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

const prev_messages = Object.assign(_.map(_.keys(channels), k => ({ [k]: '' })))

// /** array of all the current channels */
// const activeChannels = _.map(channels, c => ({ [c]: bot.channels.cache.get(c) })); 

// /** send welcome message */
// activeChannels.bots.send('Im back bois')

const send_message = async (msg,str,reply=false) => {
  if (dedo_status.fancy_text){
    str = [...str].map(c => (emoji[c] ? emoji[c] : c)).join('')
  }

  if (reply) {
    return msg.reply(str)
  }
  else {
    return msg.channel.send(str)
  }
}

bot.on('message', msg => {
  try {
    const message = msgParse(msg)
    console.log('message recieved: \n', message.data)
    /** filter all bot messages for now */
    /** same message, dont send anything, probably is spam */
    if (message.data.msg == prev_messages[msg.channel.name] || message.data.isBot) return
    // if (message.data.isBot) return
    if (message.data.msg == 'shuttup dedo') { dedo_status.active = false; send_message(msg,"youre a big bum",true) }
    if (message.data.msg == 'dedo come back') { dedo_status.active = true; send_message(msg,"im back, where the wine at") }
    if (!dedo_status.active) return

    if (message.data.msg == 'dedo get fancy') { dedo_status.fancy_text = true; send_message(msg,'check me outttt') }
    if (message.data.msg == 'dedo stop being a girl') { dedo_status.fancy_text = false; send_message(msg,'shuttup mary') }

    if (message.data.msg == 'reset') { replies = {}; send_message(msg, "dedo is RESET") }
    if (message.data.msg == 'dedo take a shit') { send_message(msg, JSON.stringify(msg, getCircularReplacer()))}
    auto_reply(message)
  }
  catch (err) {
    console.log(err)
  }
})