const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.getEnv('TELEGRAM_BOT_TOKEN'); // Substitua pelo token fornecido pelo @BotFather
const CHAT_ID = 'seu-chat-id-aqui'; // Substitua pelo ID do chat ou grupo

async function sendMessageToTelegram(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log('Mensagem enviada:', response.data);
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.message);
  }
}

// Exemplo de uso
sendMessageToTelegram('Olá, este é um teste!');