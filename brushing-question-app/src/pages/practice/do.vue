<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">&#xe60e;</text>
        <text>返回</text>
      </view>
      <view class="title">练习题</view>
      <view class="placeholder"></view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 题目内容 -->
    <view class="question-container" v-else>
      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress" :style="{ width: `${(currentIndex + 1) / questions.length * 100}%` }"></view>
        <text class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</text>
      </view>

      <!-- 计时器 -->
      <view class="timer">
        <text>{{ formatTime(timeSpent) }}</text>
      </view>

      <!-- 题目信息 -->
      <view class="question-info">
        <text class="question-type">{{ currentQuestion.type }}</text>
        <text class="question-difficulty">{{ currentQuestion.difficulty }}</text>
      </view>

      <!-- 题目内容 -->
      <view class="question-content">
        <text>{{ currentQuestion.content }}</text>
      </view>

      <!-- 选项 -->
      <view class="options">
        <view v-for="(option, index) in currentQuestion.options" :key="index" class="option-item" :class="{
            'selected': selectedAnswer === option,
            'correct': showAnswer && option === currentQuestion.answer,
            'wrong': showAnswer && selectedAnswer === option && option !== currentQuestion.answer
}" @click="selectAnswer(option)">
          <text class="option-text">{{ option }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="submit-btn" :disabled="!selectedAnswer || showAnswer" @click="submitAnswer">
          {{ showAnswer ? '下一题' : '提交答案' }}
        </button>
        <button class="report-btn" @click="reportQuestion">题目报错</button>
      </view>

      <!-- 答案解析 -->
      <view class="answer-analysis" v-if="showAnswer">
        <text class="analysis-title">答案解析</text>
        <text class="analysis-content">{{ currentQuestion.analysis }}</text>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <uni-popup ref="completePopup" type="center">
      <view class="complete-popup">
        <text class="popup-title">练习完成</text>
        <view class="popup-stats">
          <view class="stat-item">
            <text class="stat-value">{{ correctCount }}</text>
            <text class="stat-label">答对题数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ (correctCount / questions.length * 100).toFixed(1) }}%</text>
            <text class="stat-label">正确率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatTime(timeSpent) }}</text>
            <text class="stat-label">用时</text>
          </view>
        </view>
        <view class="popup-buttons">
          <button class="popup-btn" @click="restartPractice">重新练习</button>
          <button class="popup-btn primary" @click="goBack">返回首页</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useQuestionStore } from '@/store/question';
import { useUserStore } from '@/store/user';
const questionStore = useQuestionStore();
const userStore = useUserStore();

// 页面参数
const mode = ref('random');
const category = ref('all');
const lastIndex = ref(0);

// 题目数据
const questions = ref([]);
const currentIndex = ref(0);
const selectedAnswer = ref('');
const showAnswer = ref(false);
const timeSpent = ref(0);
const correctCount = ref(0);
const loading = ref(true);

// 计时器
const timer = ref(null);

// 弹窗引用
const completePopup = ref(null);

// 计算当前题目
const currentQuestion = computed(() => questions.value[currentIndex.value] || {});

console.log('currentQuestion', currentQuestion.value);
// 加载页面参数
onLoad((options) => {
  console.log('接收到practice/do页面参数:', options); // 添加日志用于调试

  if (options.mode) {
    mode.value = options.mode;
  }

  if (options.category) {
    category.value = options.category;
  }

  if (options.name) {
    categoryName.value = decodeURIComponent(options.name);
  }

  if (options.questionId) {
    questionId.value = options.questionId;
  }

  if (options.lastIndex) {
    lastIndex.value = parseInt(options.lastIndex);
  }

  // 延迟加载题目，避免闪屏
  setTimeout(() => {
    loadQuestions();
  }, 300);
});

// 监听弹窗关闭事件
onMounted(() => {
  // 需要在模板引用可用后设置弹窗关闭事件
  nextTick(() => {
    if (completePopup.value) {
      completePopup.value.$on('close', () => {
        // 弹窗关闭时返回上一级
        navigateBackOrHome();
      });
    }
  });
});

// 页面卸载时
onUnload(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  saveProgress();
});

// 加载题目数据
async function loadQuestions() {
  loading.value = true;

  try {
    // 显示加载提示
    uni.showLoading({
      title: '加载题目中...',
      mask: true
    });

    const questionList = await questionStore.loadQuestions(mode.value, category.value);
    console.log('questionList', questionList);
    if (!questionList || questionList.length === 0) {
      uni.showToast({
        title: '暂无题目',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
      return;
    }

    questions.value = questionList;

    // 如果有上次的位置，继续上次的进度
    if (lastIndex.value > 0 && lastIndex.value < questions.value.length) {
      currentIndex.value = lastIndex.value;
    } else {
      currentIndex.value = 0;
    }

    showAnswer.value = false;
    selectedAnswer.value = '';

    // 开始计时
    startTimer();

  } catch (error) {
    console.error('加载题目失败:', error);
    uni.showToast({
      title: '加载题目失败，请重试',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
}

// 选择答案
function selectAnswer(option) {
  if (!showAnswer.value) {
    selectedAnswer.value = option;
  }
}

// 提交答案
function submitAnswer() {
  if (showAnswer.value) {
    // 下一题
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
      selectedAnswer.value = '';
      showAnswer.value = false;
    } else {
      // 练习完成
      clearInterval(timer.value);
      completePopup.value.open();
    }
  } else {
    // 显示答案
    showAnswer.value = true;
    if (selectedAnswer.value === currentQuestion.value.answer) {
      correctCount.value++;
    }
  }
}

// 报告题目
function reportQuestion() {
  uni.showToast({
    title: '感谢您的反馈',
    icon: 'success'
  });
}

// 重新练习
function restartPractice() {
  currentIndex.value = 0;
  selectedAnswer.value = '';
  showAnswer.value = false;
  correctCount.value = 0;
  timeSpent.value = 0;
  completePopup.value.close();
  startTimer();
}

// 返回首页
function goBack() {
  // 使用navigateBackOrHome函数处理返回
  navigateBackOrHome();
}

// 处理返回逻辑
function navigateBackOrHome() {
  // 尝试返回上一页
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 如果没有上一页，则返回首页
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
}

// 开始计时
function startTimer() {
  timer.value = setInterval(() => {
    timeSpent.value++;
  }, 1000);
}

// 保存进度
function saveProgress() {
  if (mode.value === 'sequential' && category.value !== 'all') {
    // 保存最近的学习记录
    const record = {
      categoryId: category.value,
      categoryName: getCategoryName(category.value),
      lastIndex: currentIndex.value,
      progress: Math.round((currentIndex.value / questions.value.length) * 100)
    };

    uni.setStorageSync('lastStudyRecord', JSON.stringify(record));
  }
}

// 获取分类名称
function getCategoryName(categoryId) {
  const categories = {
    'frontend': '前端开发',
    'backend': '后端开发',
    'algorithm': '算法',
    'database': '数据库',
    'network': '计算机网络'
  };

  return categories[categoryId] || categoryId;
}
</script>

<style>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

/* 顶部导航栏样式 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-family: 'iconfont';
  margin-right: 6rpx;
  font-size: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}
.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

.progress-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.progress-bar {
  height: 6rpx;
  background: #eee;
  border-radius: 3rpx;
  margin-top: 10rpx;
  width: 200rpx;
}

.progress-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 3rpx;
  transition: width 0.3s;
}

.timer {
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.question-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 20rpx;
  background-color: #fff;
}

.question-type {
  font-size: 26rpx;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.difficulty {
  display: flex;
}

.difficulty-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: #e8e8e8;
  margin-left: 8rpx;
}

.difficulty-dot.active {
  background: #ff9500;
}

.question-scroll {
  flex: 1;
  padding: 20rpx;
}

.question-content {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
}

.question-images {
  margin-top: 20rpx;
}

.question-image {
  width: 100%;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.options {
  margin-bottom: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.option-item.selected {
  background: #e6f7ff;
  border: 2rpx solid #1890ff;
}

.option-item.correct {
  background: #f6ffed;
  border: 2rpx solid #52c41a;
}

.option-item.wrong {
  background: #fff1f0;
  border: 2rpx solid #ff4d4f;
}

.option-label {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 30rpx;
  background: #f5f5f5;
  margin-right: 20rpx;
  font-size: 28rpx;
}

.option-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.answer-analysis {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.result-banner {
  display: flex;
  align-items: center;
  padding: 15rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.correct-banner {
  background: rgba(82, 196, 26, 0.1);
}

.wrong-banner {
  background: rgba(255, 77, 79, 0.1);
}

.result-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.result-text {
  font-size: 30rpx;
  font-weight: bold;
}

.correct-answer {
  margin-bottom: 20rpx;
}

.analysis-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.analysis-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.correct-options {
  font-size: 28rpx;
  color: #52c41a;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  padding: 15rpx 0;
  background: #f5f5f5;
  border: none;
  border-radius: 8rpx;
  margin: 0 10rpx;
}

.btn-icon {
  margin-right: 8rpx;
}

.bottom-bar {
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
}

.submit-btn, .prev-btn, .next-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}

.submit-btn {
  background: #1890ff;
  color: #fff;
}

.submit-btn[disabled] {
  background: #cccccc;
  color: #ffffff;
}

.prev-btn {
  background: #f5f5f5;
  color: #666;
}

.next-btn {
  background: #1890ff;
  color: #fff;
}

.report-popup, .finish-popup {
  background: #fff;
  border-radius: 16rpx;
  width: 600rpx;
  padding: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.report-options {
  display: flex;
  flex-wrap: wrap;
}

.report-option {
  width: 45%;
  background: #f5f5f5;
  padding: 15rpx;
  border-radius: 8rpx;
  margin: 10rpx;
  text-align: center;
  font-size: 26rpx;
}

.report-option.selected {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.report-text {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-top: 20rpx;
  font-size: 28rpx;
}

.popup-buttons {
  display: flex;
  margin-top: 30rpx;
}

.cancel-btn, .confirm-btn, .review-btn, .finish-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn, .finish-btn {
  background: #1890ff;
  color: #fff;
}

.review-btn {
  background: #ff9500;
  color: #fff;
}

.popup-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.finish-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.finish-subtitle {
  font-size: 28rpx;
  color: #999;
  margin-top: 10rpx;
}

.result-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background: #f0f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
}

.result-percentage {
  font-size: 48rpx;
  font-weight: bold;
  color: #1890ff;
}

.result-label {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.result-details {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.result-key {
  color: #666;
  font-size: 28rpx;
}

.result-value {
  color: #333;
  font-size: 28rpx;
  font-weight: bold;
}

.complete-popup {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  width: 600rpx;
  
  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 40rpx;
    display: block;
  }
  
  .popup-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40rpx;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: #1890ff;
        display: block;
        margin-bottom: 10rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  .popup-buttons {
    display: flex;
    gap: 20rpx;
    
    .popup-btn {
      flex: 1;
      background-color: #fff;
      color: #666;
      border: 2rpx solid #d9d9d9;
      border-radius: 8rpx;
      
      &.primary {
        background-color: #1890ff;
        color: #fff;
        border: none;
      }
    }
  }
}
</style>
