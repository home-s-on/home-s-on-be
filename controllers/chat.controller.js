const { User, ChatHistory } = require("../models");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: `${process.env.OPENAI_API_BASE}/openai/deployments/gpt-4o-mini`,
  defaultQuery: { "api-version": "2024-08-01-preview" },
  defaultHeaders: { "api-key": process.env.OPENAI_API_KEY },
});

const chatController = {};

chatController.sendChat = async (req, res) => {
  try {
    const { userId } = req;
    console.log(userId);
    const { userMessage } = req.body;

    const messages = [
      {
        role: "system",
        content: "사용자에게 집안일과 관련된 조언을 제공합니다.",
      },
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      messages: messages,
    });

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

chatController.getChat = async (req, res) => {
  try {
    const { userId } = req;
    const existingChat = await ChatHistory.findAll({
      where: { user_id: userId },
    });

    return res.status(200).json({
      status: "success",
      data: {
        existingChat,
      },
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = chatController;
