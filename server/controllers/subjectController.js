const { Subject, Question, Chapter, sequelize } = require("../models/index");
const { Op } = require("sequelize");

class SubjectController {
  // 获取科目列表
  async getSubjects(req, res) {
    try {
      // 先获取所有科目
      const subjects = await Subject.findAll({
        attributes: [
          "id",
          "name",
          "icon",
          "description",
          "color",
          "type",
          "orderIndex",
        ],
      });

      // 获取每个科目的题目数量
      const subjectIds = subjects.map((subject) => subject.id);
      const questionCounts = await Question.findAll({
        attributes: [
          "subjectId",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          subjectId: { [Op.in]: subjectIds },
          status: "active",
        },
        group: ["subjectId"],
        raw: true,
      });

      // 创建题目数量映射
      const countMap = {};
      questionCounts.forEach((item) => {
        countMap[item.subjectId] = item.count;
      });

      // 为每个科目添加题目数量
      const result = subjects.map((subject) => ({
        ...subject.toJSON(),
        questionCount: countMap[subject.id] || 0,
      }));

      res.json({
        code: 0,
        data: result,
      });
    } catch (error) {
      console.error("Get subjects error:", error);
      res.status(500).json({ code: 500, message: "获取科目列表失败" });
    }
  }

  // 获取科目详情
  async getSubjectDetail(req, res) {
    try {
      const { id } = req.params;

      // 先查询科目
      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({ code: 404, message: "科目不存在" });
      }

      // 单独查询该科目下的章节
      const chapters = await Chapter.findAll({
        where: { subjectId: id },
        attributes: ["id", "name", "description", "orderIndex"],
      });

      // 为每个章节查询题目数量
      const chapterIds = chapters.map((chapter) => chapter.id);
      const questionCounts = await Question.findAll({
        attributes: [
          "chapterId",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          chapterId: { [Op.in]: chapterIds },
          status: "active",
        },
        group: ["chapterId"],
        raw: true,
      });

      // 题目数量映射
      const countMap = {};
      questionCounts.forEach((item) => {
        countMap[item.chapterId] = item.count;
      });

      // 组织返回结果
      const result = {
        ...subject.toJSON(),
        chapters: chapters.map((chapter) => ({
          ...chapter.toJSON(),
          questionCount: countMap[chapter.id] || 0,
        })),
      };

      // 查询该科目下的总题目数
      const totalQuestions = await Question.count({
        where: {
          subjectId: id,
          status: "active",
        },
      });

      // 添加总题目数到结果中
      result.questionCount = totalQuestions;

      res.json({
        code: 0,
        data: result,
      });
    } catch (error) {
      console.error("Get subject detail error:", error);
      res.status(500).json({ code: 500, message: "获取科目详情失败" });
    }
  }

  // 获取热门科目
  async getHotSubjects(req, res) {
    try {
      // 查询题目数量最多的科目作为热门科目
      // 先获取所有科目的题目数量
      const subjectCounts = await Question.findAll({
        attributes: [
          "subjectId",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { status: "active" },
        group: ["subjectId"],
        order: [[sequelize.literal("count"), "DESC"]],
        limit: 5,
        raw: true,
      });

      // 如果没有数据，返回空数组
      if (subjectCounts.length === 0) {
        return res.json({
          code: 0,
          data: [],
        });
      }

      // 获取这些热门科目的ID
      const hotSubjectIds = subjectCounts.map((item) => item.subjectId);

      // 查询这些科目的详细信息
      const hotSubjects = await Subject.findAll({
        where: { id: { [Op.in]: hotSubjectIds } },
        attributes: [
          "id",
          "name",
          "icon",
          "description",
          "color",
          "type",
          "orderIndex",
        ],
      });

      // 创建题目数量映射
      const countMap = {};
      subjectCounts.forEach((item) => {
        countMap[item.subjectId] = item.count;
      });

      // 添加题目数量并按原始顺序排序
      const result = hotSubjects.map((subject) => ({
        ...subject.toJSON(),
        questionCount: countMap[subject.id] || 0,
      }));

      // 按题目数量排序
      result.sort((a, b) => b.questionCount - a.questionCount);

      res.json({
        code: 0,
        data: result,
      });
    } catch (error) {
      console.error("Get hot subjects error:", error);
      res.status(500).json({ code: 500, message: "获取热门科目失败" });
    }
  }
}

module.exports = new SubjectController();
