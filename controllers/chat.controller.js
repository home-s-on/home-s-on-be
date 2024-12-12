const { ChatHistory, Task } = require("../models");
const { OpenAI } = require("openai");
require("dotenv").config();
const { Op } = require("sequelize");

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

chatController.motivationChat = async (req, res) => {
  try {
    const { userId } = req;

    const tasks = await Task.findAll({
      where: {
        user_id: userId,
        due_date: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    });

    const completedTasks = tasks.filter((task) => task.complete);
    const completionRate = (completedTasks.length / tasks.length) * 100 || 0;

    let motivationMessage;

    if (completionRate >= 80) {
      motivationMessage =
        "훌륭해요! 이번 주에 많은 일을 완료하셨습니다. 계속 이렇게 잘 해보세요!";
    } else if (completionRate >= 50) {
      motivationMessage =
        "좋아요! 절반 이상 완료하셨습니다. 조금 더 힘내서 목표를 달성해보세요!";
    } else {
      const incompleteTaskTitles = tasks
        .filter((task) => !task.complete)
        .map((task) => task.title);
      motivationMessage = `이번 주에 완료된 작업은 적지만, ${incompleteTaskTitles[0]} 하나라도 완료하면 큰 도움이 될 거예요!`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "너는 사용자에게 일주일치 집안일에 대한 상황을 받아서 상황에 맞는 동기부여 메시지를 주는 역할을 가지고 있어. 메시지는 긍정적이고 간결하며, 사용자가 집안일을 완료할 수 있도록 격려하는 내용을 포함했으면 좋겠어. 20자를 넘지 않고 사용자에게 친근감을 줄 수 있는 어조를 사용해줘.",
        },
        {
          role: "user",
          content: motivationMessage,
        },
      ],
    });
    const aiMessage = response.choices[0].message.content;

    return res.status(200).json({ status: "success", message: aiMessage });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = chatController;
