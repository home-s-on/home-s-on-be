const { User, ChatHistory } = require("../models");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_API_BASE,
});

const chatController = {};

chatController.sendChat = async (req, res) => {
  try {
    const { userId } = req;
    const { userMessage } = req.body;

    const messages = [
      {
        role: "system",
        content: "사용자에게 집안일과 관련된 조언을 제공합니다.",
      },
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });
    console.log("sendChat response", response);

    // ChatGPT의 응답 추출
    const assistantResponse = response.choices[0].message.content;

    await ChatHistory.create({
      user_id: userId,
      user_message: userMessage,
      assistant_response: assistantResponse,
    });

    return res.status(200).json({
      status: "success",
      data: {
        userMessage,
        assistantResponse,
      },
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = chatController;
