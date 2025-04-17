const { StudyPlan, Subject, User } = require("../models/index");
const sequelize = require("sequelize");

class StudyPlanController {
  // 获取用户的学习计划列表
  async getStudyPlans(req, res) {
    try {
      const userId = req.user.id;
      const plans = await StudyPlan.findAll({
        where: { userId },
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.json({
        code: 0,
        data: plans,
        message: "获取学习计划成功",
      });
    } catch (error) {
      console.error("获取学习计划失败:", error);
      return res.status(500).json({
        code: 500,
        message: "获取学习计划失败",
      });
    }
  }

  // 创建学习计划
  async createStudyPlan(req, res) {
    try {
      const userId = req.user.id;
      const { title, categoryId, days, questionsPerDay } = req.body;

      if (!title || !categoryId) {
        return res.status(400).json({
          code: 400,
          message: "标题和分类不能为空",
        });
      }

      // 创建计划
      const plan = await StudyPlan.create({
        userId,
        title,
        categoryId,
        days: days || 7,
        questionsPerDay: questionsPerDay || 10,
        progress: 0,
        startDate: new Date(),
      });

      return res.json({
        code: 0,
        data: plan,
        message: "创建学习计划成功",
      });
    } catch (error) {
      console.error("创建学习计划失败:", error);
      return res.status(500).json({
        code: 500,
        message: "创建学习计划失败",
      });
    }
  }

  // 更新学习计划进度
  async updatePlanProgress(req, res) {
    try {
      const userId = req.user.id;
      const { planId } = req.params;
      const { progress } = req.body;

      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        return res.status(404).json({
          code: 404,
          message: "计划不存在",
        });
      }

      // 更新进度
      plan.progress = progress;
      if (progress >= 100) {
        plan.endDate = new Date();
      }
      await plan.save();

      return res.json({
        code: 0,
        data: plan,
        message: "更新计划进度成功",
      });
    } catch (error) {
      console.error("更新计划进度失败:", error);
      return res.status(500).json({
        code: 500,
        message: "更新计划进度失败",
      });
    }
  }

  // 删除学习计划
  async deleteStudyPlan(req, res) {
    try {
      const userId = req.user.id;
      const { planId } = req.params;

      const result = await StudyPlan.destroy({
        where: { id: planId, userId },
      });

      if (result === 0) {
        return res.status(404).json({
          code: 404,
          message: "计划不存在或无权限删除",
        });
      }

      return res.json({
        code: 0,
        message: "删除计划成功",
      });
    } catch (error) {
      console.error("删除计划失败:", error);
      return res.status(500).json({
        code: 500,
        message: "删除计划失败",
      });
    }
  }
}

module.exports = new StudyPlanController();
