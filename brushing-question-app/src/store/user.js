import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: {
      nickname: "刷题达人",
      avatar: "/static/images/default-avatar.png",
    },
    token: "",
    statistics: {
      totalQuestions: 0,
      correctQuestions: 0,
      correctRate: 0,
      streak: 0,
      todayQuestions: 0,
      lastLoginDate: null,
    },
  }),

  actions: {
    async login() {
      try {
        const [err, res] = await uni.login();
        if (err) {
          throw new Error("登录失败");
        }

        // 这里通常应该发送请求到后端换取用户信息
        // 现在暂时使用模拟数据
        this.userInfo = {
          nickname: "用户" + Math.floor(Math.random() * 10000),
          avatar: "/static/images/default-avatar.png",
        };

        this.token = "mock_token_" + Date.now();
        uni.setStorageSync("token", this.token);

        return true;
      } catch (error) {
        console.error("登录失败:", error);
        return false;
      }
    },

    updateStatistics(isCorrect) {
      this.statistics.totalQuestions++;
      if (isCorrect) {
        this.statistics.correctQuestions++;
      }

      // 更新正确率
      this.statistics.correctRate = Math.round(
        (this.statistics.correctQuestions / this.statistics.totalQuestions) *
          100
      );

      // 更新今日题数
      this.statistics.todayQuestions++;

      // 更新连续天数
      const today = new Date().toDateString();
      const lastDate = this.statistics.lastLoginDate;

      if (!lastDate) {
        this.statistics.streak = 1;
      } else {
        const lastDay = new Date(lastDate);
        const diffTime = new Date(today) - lastDay;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // 连续天数+1
          this.statistics.streak++;
        } else if (diffDays > 1) {
          // 重置连续天数
          this.statistics.streak = 1;
        }
        // 当天重复登录，连续天数不变
      }

      this.statistics.lastLoginDate = today;

      // 保存到本地
      this.saveStatistics();
    },

    saveStatistics() {
      try {
        uni.setStorageSync("userStatistics", JSON.stringify(this.statistics));
      } catch (error) {
        console.error("保存用户统计数据失败:", error);
      }
    },

    init() {
      try {
        // 从本地读取用户信息
        const userInfoStr = uni.getStorageSync("userInfo");
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr);
        }

        // 从本地读取统计数据
        const statisticsStr = uni.getStorageSync("userStatistics");
        if (statisticsStr) {
          this.statistics = JSON.parse(statisticsStr);
        }

        // 检查今日是否已登录
        const today = new Date().toDateString();
        if (this.statistics.lastLoginDate !== today) {
          // 重置今日题数
          this.statistics.todayQuestions = 0;
          this.statistics.lastLoginDate = today;
          this.saveStatistics();
        }
      } catch (error) {
        console.error("初始化用户数据失败:", error);
      }
    },
  },
});
