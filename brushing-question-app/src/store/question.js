import { defineStore } from "pinia";

export const useQuestionStore = defineStore("question", {
  state: () => ({
    questions: [],
    currentIndex: 0,
    wrongQuestions: [],
    favoriteQuestions: [],
    categoryProgress: {},
  }),

  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || {},
  },

  actions: {
    // 加载题目
    async loadQuestions(mode, category) {
      try {
        // 模拟API请求
        console.log(`加载题目：模式=${mode}, 分类=${category}`);

        // 根据模式和分类获取不同题目
        let questions = [];

        // 模拟数据
        if (mode === "random") {
          questions = this.generateMockQuestions(10);
        } else if (mode === "wrong") {
          questions = this.generateMockQuestions(5, true);
        } else if (mode === "favorite") {
          questions = this.generateMockQuestions(8, false, true);
        } else {
          questions = this.generateMockQuestions(15);
        }

        this.questions = questions;
        return questions;
      } catch (error) {
        console.error("加载题目失败:", error);
        uni.showToast({
          title: "加载题目失败",
          icon: "none",
        });
        return [];
      }
    },

    // 检查答案
    checkAnswer(questionId, selectedOptions) {
      try {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) return false;

        // 获取正确选项
        const correctOptions = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);

        // 判断答案是否正确
        if (correctOptions.length !== selectedOptions.length) return false;

        // 检查所有选择的选项是否都正确
        return (
          selectedOptions.every((option) => correctOptions.includes(option)) &&
          correctOptions.every((option) => selectedOptions.includes(option))
        );
      } catch (error) {
        console.error("检查答案失败:", error);
        return false;
      }
    },

    // 添加到错题本
    addToWrongQuestions(questionId) {
      if (!this.wrongQuestions.includes(questionId)) {
        this.wrongQuestions.push(questionId);
        // 存储到本地
        this.saveWrongQuestions();
      }
    },

    // 保存错题本
    saveWrongQuestions() {
      try {
        uni.setStorageSync(
          "wrongQuestions",
          JSON.stringify(this.wrongQuestions)
        );
      } catch (error) {
        console.error("保存错题本失败:", error);
      }
    },

    // 切换收藏状态
    toggleFavorite(questionId) {
      const index = this.favoriteQuestions.indexOf(questionId);
      if (index === -1) {
        // 添加收藏
        this.favoriteQuestions.push(questionId);
      } else {
        // 取消收藏
        this.favoriteQuestions.splice(index, 1);
      }

      // 存储到本地
      this.saveFavorites();
    },

    // 保存收藏
    saveFavorites() {
      try {
        uni.setStorageSync(
          "favoriteQuestions",
          JSON.stringify(this.favoriteQuestions)
        );
      } catch (error) {
        console.error("保存收藏失败:", error);
      }
    },

    // 搜索题目
    async searchQuestions(keyword) {
      try {
        console.log(`搜索题目：${keyword}`);
        // 模拟搜索请求
        const results = this.generateMockQuestions(5).map((q) => {
          // 在题目内容中添加关键词以模拟匹配
          return {
            ...q,
            content: `${keyword}相关的${q.content}`,
          };
        });

        return results;
      } catch (error) {
        console.error("搜索题目失败:", error);
        return [];
      }
    },

    // 按分类获取题目
    async getQuestionsByCategory(categoryId, page, pageSize) {
      try {
        console.log(
          `获取分类题目：分类=${categoryId}, 页码=${page}, 每页数量=${pageSize}`
        );

        // 模拟分页数据
        const totalCount = 100;
        const questions = this.generateMockQuestions(
          pageSize,
          false,
          false,
          categoryId
        );
        const hasMore = page * pageSize < totalCount;

        return {
          questions,
          hasMore,
          total: totalCount,
        };
      } catch (error) {
        console.error("获取分类题目失败:", error);
        return {
          questions: [],
          hasMore: false,
          total: 0,
        };
      }
    },

    // 获取分类进度
    async getCategoryProgress() {
      try {
        // 修改为计算机专业科目的进度
        return {
          // 数据结构
          'datastructure_linear': 45,
          'datastructure_tree': 30,
          'datastructure_graph': 15,
          'datastructure_algorithm': 20,
          
          // 操作系统
          'os_process': 35,
          'os_memory': 25,
          'os_file': 40,
          'os_io': 15,
          
          // 计算机网络
          'network_base': 50,
          'network_tcp': 30,
          'network_application': 25,
          'network_security': 10,
          
          // 计算机组成原理
          'architecture_cpu': 20,
          'architecture_memory': 15,
          'architecture_io': 35,
          'architecture_bus': 30,
        };
      } catch (error) {
        console.error("获取分类进度失败:", error);
        return {};
      }
    },

    // 生成模拟题目数据
    generateMockQuestions(
      count = 10,
      isWrong = false,
      isFavorite = false,
      categoryId = null
    ) {
      const questions = [];
      const types = ["single", "multiple", "judge"];
      
      // 修改分类为计算机专业科目
      const categories = {
        // 数据结构
        'datastructure': '数据结构',
        'datastructure_linear': '线性数据结构',
        'datastructure_tree': '树结构',
        'datastructure_graph': '图论',
        'datastructure_algorithm': '算法设计',
        
        // 操作系统
        'os': '操作系统',
        'os_process': '进程与线程',
        'os_memory': '内存管理',
        'os_file': '文件系统',
        'os_io': 'I/O系统',
        
        // 计算机网络
        'network': '计算机网络',
        'network_base': '网络基础',
        'network_tcp': 'TCP/IP协议',
        'network_application': '应用层协议',
        'network_security': '网络安全',
        
        // 计算机组成原理
        'architecture': '计算机组成原理',
        'architecture_cpu': 'CPU与指令系统',
        'architecture_memory': '存储系统',
        'architecture_io': '输入输出系统',
        'architecture_bus': '总线结构'
      };

      for (let i = 0; i < count; i++) {
        const id = `q${Date.now() + i}`;
        const type = types[Math.floor(Math.random() * types.length)];
        const difficulty = Math.floor(Math.random() * 5) + 1;

        let category =
          categoryId ||
          Object.keys(categories)[
            Math.floor(Math.random() * Object.keys(categories).length)
          ];
        let categoryName = categories[category] || "未知分类";

        const options = [];
        let optionCount = type === "judge" ? 2 : type === "single" ? 4 : 5;

        for (let j = 0; j < optionCount; j++) {
          const optionId = String.fromCharCode(65 + j); // A, B, C, ...
          options.push({
            id: optionId,
            text: `选项${optionId}的内容`,
            isCorrect:
              type === "judge"
                ? j === 0
                : type === "single"
                ? j === 0
                : [0, 2].includes(j),
          });
        }

        questions.push({
          id,
          type,
          content: `这是一道${categoryName}的${
            type === "single" ? "单选" : type === "multiple" ? "多选" : "判断"
          }题，难度为${difficulty}星，序号为${i + 1}`,
          options,
          analysis: `这道题的解析是...`,
          difficulty,
          category: categoryName,
          isDone: Math.random() > 0.5,
          isWrong: isWrong,
          isFavorite: isFavorite,
          images: [],
        });
      }

      return questions;
    },

    // 初始化状态
    init() {
      try {
        // 从本地读取收藏和错题
        const favoriteStr = uni.getStorageSync("favoriteQuestions");
        if (favoriteStr) {
          this.favoriteQuestions = JSON.parse(favoriteStr);
        }

        const wrongStr = uni.getStorageSync("wrongQuestions");
        if (wrongStr) {
          this.wrongQuestions = JSON.parse(wrongStr);
        }
      } catch (error) {
        console.error("初始化题目存储失败:", error);
      }
    },
  },
});
