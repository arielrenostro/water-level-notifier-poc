import axios from 'axios'

const botToken = process.env.TELEGRAM_BOT_TOKEN
const botSecretApi = process.env.TELEGRAM_BOT_SECRET_API

const commands = {
    '/echo': handleEcho,
    '/register': handleRegister,
    '/start': handleStart,
    '/help': handleHelp,
    '/watterlevel': handleWatterLevel,
}

const helpText = '/echo {message} -> Just echo the sent message\n' +
    '/register {code} -> Use it for register using your code\n' +
    '/start -> Use it for start the chat\n' +
    '/watterlevel -> Shows water level of all sensors\n' +
    '/help -> Print this help guide'

export const handler = async (event) => {
    if (event.headers['x-telegram-bot-api-secret-token'] !== botSecretApi) {
        console.warn('Invalid secret token')
        return {
            statusCode: 401,
            body: ''
        }
    }

    if (event.headers['content-type'] !== 'application/json') {
        return errorResponse(`Invalid content-type: ${event.headers['content-type']}`)
    }

    const body = JSON.parse(event.body)
    if (typeof body['message'] !== 'object') {
        return errorResponse(`Invalid body, without 'message'`)
    }

    const message = body['message']?.['text']
    if (!message) {
        return errorResponse(`Invalid body, without 'text'`)
    }

    const chatId = body['message']?.['chat']?.['id']
    if (!chatId) {
        return errorResponse(`Invalid body, without 'chat id'`)
    }

    const firstname = body['message']?.['from']?.['first_name'] || 'Sem nome'

    let found = false
    for (const command in commands) {
        if (message.startsWith(command)) {
            found = true
            const params = {
                body,
                message,
                chatId,
                firstname,
                command: {
                    key: command,
                    value: message.substr(command.length).trim(),
                }
            }
            console.info(`Command found: "${params.command.key}`)
            const fn = commands[command]
            await fn(params)
            break
        }
    }

    if (!found) {
        console.info(`Command not found: "${message}`)
        await sendMessageToTelegram(chatId, `Sorry, didn't know that.\n\n${helpText}`)
    }

    return {
        statusCode: 200
    }
};

async function handleEcho(params) {
    await sendMessageToTelegram(
        params.chatId,
        `Hello, ${params.firstname}.\n\nYou said: ${params.command.value}`,
    )
}

async function handleStart(params) {
    await sendMessageToTelegram(
        params.chatId,
        `Hello, ${params.firstname}.\n\nHere is the options that you have:\n\n${helpText}`,
    )
}

async function handleRegister(params) {
    await sendMessageToTelegram(
        params.chatId,
        `Hello, ${params.firstname}.\n\nRegistration made successfully with code ${params.command.value}.`,
    )
}

async function handleHelp(params) {
    await sendMessageToTelegram(params.chatId, helpText)
}

async function handleWatterLevel(params) {
    const date = new Date(Date.now() - (Math.random() * 200 * 1000) - (3 * 60 * 60 * 1000))
    const cisternaLevel = Math.trunc(Math.random() * 100)
    const caixaLevel = Math.trunc(Math.random() * 100)

    await sendMessageToTelegram(
        params.chatId,
        `Hello, ${params.firstname}.
        
Here are the levels at *${date.toLocaleTimeString()}*:

* *Cisterna*: ${cisternaLevel}% - ${cisternaLevel * 50000 / 100}L
* *Caixa d'água*: ${caixaLevel}% - ${caixaLevel * 35000 / 100}L`,
    )
}

async function sendMessageToTelegram(chatId, message) {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'markdown'
        });
    } catch (error) {
        console.error('Failure during send message to Telegram:', error.message);
    }
}

function errorResponse(message) {
    console.error(message)
    return {
        statusCode: 400,
        body: JSON.stringify({ 'message': message })
    }
}