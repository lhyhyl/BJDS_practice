import { defineStore } from "pinia";
import { request } from "../utils/request";

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
    async loadQuestions(mode, category, params = {}) {
      try {
        console.log(`加载题目：模式=${mode}, 分类=${category}`);

        // 使用真实API请求
        let url = "/api/questions";
        let requestParams = { ...params };

        if (mode === "wrong") {
          url = "/api/errorbook";
        } else if (mode === "favorite") {
          url = "/api/favorites";
        } else if (mode === "daily") {
          url = "/api/questions/daily";
        } else {
          // 普通模式，可以按分类筛选
          if (category && category !== "all") {
            requestParams.subjectId = category;
          }

          // 如果有指定的题目IDs
          if (params.ids && Array.isArray(params.ids)) {
            requestParams.ids = params.ids.join(",");
          }
        }

        const response = await request({
          url,
          method: "GET",
          data: requestParams,
        });
        if (response.code === 0 && response.data) {
          this.questions = response.data;
          return response.data.list;
        }

        return [];
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
    async checkAnswer(questionId, selectedOptions) {
      try {
        const response = await request({
          url: "/api/questions/submit",
          method: "POST",
          data: {
            questionId,
            answer: Array.isArray(selectedOptions)
              ? selectedOptions.join(",")
              : selectedOptions,
          },
        });

        if (response.code === 0) {
          return response.data.isCorrect;
        }
        return false;
      } catch (error) {
        console.error("检查答案失败:", error);
        return false;
      }
    },

    // 添加到错题本
    async addToWrongQuestions(questionId) {
      try {
        const response = await request({
          url: "/api/errorbook",
          method: "POST",
          data: { questionId },
        });

        if (response.code === 0) {
          if (!this.wrongQuestions.includes(questionId)) {
            this.wrongQuestions.push(questionId);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("添加错题失败:", error);
        return false;
      }
    },

    // 从本地加载错题本
    loadWrongQuestions() {
      try {
        const wrongQuestionsStr = uni.getStorageSync("wrongQuestions");
        if (wrongQuestionsStr) {
          this.wrongQuestions = JSON.parse(wrongQuestionsStr);
        }
      } catch (error) {
        console.error("加载错题本失败:", error);
      }
    },

    // 切换收藏状态
    async toggleFavorite(questionId) {
      try {
        const isFavorite = this.favoriteQuestions.includes(questionId);

        if (isFavorite) {
          // 取消收藏
          const response = await request({
            url: `/api/favorites/${questionId}`,
            method: "DELETE",
          });

          if (response.code === 0) {
            const index = this.favoriteQuestions.indexOf(questionId);
            if (index !== -1) {
              this.favoriteQuestions.splice(index, 1);
            }
          }
        } else {
          // 添加收藏
          const response = await request({
            url: "/api/favorites",
            method: "POST",
            data: { questionId },
          });

          if (response.code === 0) {
            this.favoriteQuestions.push(questionId);
          }
        }

        // 保存到本地
        this.saveFavorites();
        return !isFavorite;
      } catch (error) {
        console.error("操作收藏失败:", error);
        return false;
      }
    },

    // 保存收藏到本地缓存
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

    // 从本地加载收藏
    loadFavorites() {
      try {
        const favoritesStr = uni.getStorageSync("favoriteQuestions");
        if (favoritesStr) {
          this.favoriteQuestions = JSON.parse(favoritesStr);
        }
      } catch (error) {
        console.error("加载收藏失败:", error);
      }
    },

    // 搜索题目
    async searchQuestions(keyword) {
      try {
        const response = await request({
          url: "/api/questions/search",
          method: "GET",
          data: { keyword },
        });

        if (response.code === 0 && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error("搜索题目失败:", error);
        return [];
      }
    },

    // 按分类获取题目
    async getQuestionsByCategory(categoryId, page = 1, pageSize = 20) {
      try {
        const response = await request({
          url: "/api/questions",
          method: "GET",
          data: {
            subjectId: categoryId,
            page,
            pageSize,
          },
        });

        if (response.code === 0 && response.data) {
          return {
            questions: response.data.list || [],
            hasMore: response.data.hasMore || false,
            total: response.data.total || 0,
          };
        }

        return {
          questions: [],
          hasMore: false,
          total: 0,
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
        const response = await request({
          url: "/api/statistics/progress",
          method: "GET",
        });

        if (response.code === 0 && response.data) {
          this.categoryProgress = response.data;
          return response.data;
        }
        return {};
      } catch (error) {
        console.error("获取分类进度失败:", error);
        return {};
      }
    },

    // 初始化
    init() {
      // 从本地加载错题和收藏
      this.loadWrongQuestions();
      this.loadFavorites();
    },
  },
});
