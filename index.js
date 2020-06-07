import axios from "axios";
import getLyrics from "./lyrics.mjs";
import { botToken } from "./config.mjs";

let lastUpdateId = null;
const ONE_SECONDS_IN_MS = 1000;

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const bot = axios.create({
  baseURL: `https://api.telegram.org/bot${botToken}`,
});

const getUpdates = async () => {
  console.log("lastUpdateId : ", lastUpdateId)
  try {

    const { data } = await bot.get("/getUpdates", {
      params: {
        offset: lastUpdateId,
        limit: 1
      }
    });

    if (data.result.length === 1) {
      const { message, update_id } = data.result[0];
      lastUpdateId = update_id + 1;

      switch (message.text) {
        case "/lyrics":
          const lyrics = await getLyrics();
          await sendMessage(message.chat.id, lyrics);
          break;
      }
    }

  } catch (error) {
    console.error(error);
  }
};

async function sendMessage(chatId, text) {
  await bot.post("/sendMessage", {
      chat_id: chatId,
      text
  });
}

(async () => {

  for (;;) {
    await getUpdates()
    await sleep(ONE_SECONDS_IN_MS);
  }

})();