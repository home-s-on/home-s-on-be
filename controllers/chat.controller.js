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
    const { userMessage } = req.body;

    // 이전 대화 내용 불러오기
    const previousChats = await ChatHistory.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]],
      limit: 5,
    });

    const messages = [
      {
        role: "system",
        content:
          "사용자에게 집안일과 관련된 조언을 제공합니다. 반드시 300자 이내로 답변하세요. 300자를 초과하지 마세요. 줄바꿈을 잘 해주세요",
      },
      ...previousChats.reverse().flatMap((chat) => [
        { role: "user", content: chat.user_message },
        { role: "assistant", content: chat.assistant_response },
      ]),
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    const assistantResponse = response.choices[0].message.content;

    // 새로운 대화 기록 생성
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
    console.error(e);
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
