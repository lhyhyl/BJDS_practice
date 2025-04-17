<template>
  <view class="container">
    <view class="header">
      <text class="title">刷题练习</text>
    </view>
    
    <!-- 数据概览 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.todayQuestions }}</text>
        <text class="stat-label">今日题数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.streak }}天</text>
        <text class="stat-label">连续刷题</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.correctRate }}%</text>
        <text class="stat-label">正确率</text>
      </view>
    </view>
    
    <!-- 练习模式 -->
    <view class="practice-section">
      <view class="section-title">练习模式</view>
      <view class="practice-grid">
        <view class="practice-item" @tap="startPractice('random')">
          <view class="practice-icon random-icon">🎲</view>
          <text class="practice-name">随机练习</text>
          <text class="practice-desc">从题库随机抽取题目</text>
        </view>
        
        <view class="practice-item" @tap="startPractice('wrong')">
          <view class="practice-icon wrong-icon">📝</view>
          <text class="practice-name">错题练习</text>
          <text class="practice-desc">重点攻克做错的题目</text>
        </view>
        
        <view class="practice-item" @tap="startPractice('daily')">
          <view class="practice-icon daily-icon">📅</view>
          <text class="practice-name">每日一练</text>
          <text class="practice-desc">每日精选10道题</text>
        </view>
        
        <view class="practice-item" @tap="startPractice('favorite')">
          <view class="practice-icon favorite-icon">⭐</view>
          <text class="practice-name">收藏题目</text>
          <text class="practice-desc">练习已收藏的题目</text>
        </view>
        
        <view class="practice-item" @tap="navigateTo('/pages/mine/study-plan')">
          <view class="practice-icon plan-icon">📊</view>
          <text class="practice-name">学习计划</text>
          <text class="practice-desc">按计划系统学习</text>
        </view>
        
        <view class="practice-item" @tap="startPractice('exam')">
          <view class="practice-icon exam-icon">📚</view>
          <text class="practice-name">模拟考试</text>
          <text class="practice-desc">限时模拟真实考试</text>
        </view>
      </view>
    </view>
    
    <!-- 热门分类 -->
    <view class="category-section">
      <view class="section-title">热门分类</view>
      <scroll-view scroll-x class="category-scroll">
        <view 
          v-for="(category, index) in hotCategories" 
          :key="index"
          class="category-item"
          @tap="navigateToCategory(category.id, category.name)"
        >
          <image class="category-bg" :src="category.image" mode="aspectFill"></image>
          <view class="category-mask"></view>
          <view class="category-info">
            <text class="category-name">{{ category.name }}</text>
            <text class="category-count">{{ category.count }}题</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 练习统计 -->
    <view class="weekly-section">
      <view class="section-title">每周统计</view>
      <view class="weekly-chart">
        <view 
          v-for="(day, index) in weekData" 
          :key="index"
          class="weekly-item"
        >
          <view class="weekly-bar-container">
            <view 
              class="weekly-bar" 
              :style="{ height: `${day.count > 0 ? day.count / maxCount * 150 : 0}rpx` }"
              :class="{ 'today': day.isToday }"
            ></view>
          </view>
          <text class="weekly-day">{{ day.label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部TabBar -->
    <!-- <tab-bar :current="2" @change="handleTabChange"></tab-bar> -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuestionStore } from '@/store/question';
import { useUserStore } from '@/store/user';
import TabBar from '../tabbar.vue';

const questionStore = useQuestionStore();
const userStore = useUserStore();

// 热门分类
const hotCategories = ref([
  {
    id: 'javascript',
    name: 'JavaScript',
    count: 512,
    image: '/static/images/category/JavaScript.png'
  },
  {
    id: 'react',
    name: 'React',
    count: 324,
    image: '/static/images/category/react.png'
  },
  {
    id: 'python',
    name: 'Python',
    count: 456,
    image: '/static/images/category/python.png'
  },
  {
    id: 'algorithm',
    name: '算法',
    count: 278,
    image: '/static/images/category/algorithm.png'
  }
]);

// 每周数据
const weekData = ref([
  { label: '一', count: 32, isToday: false },
  { label: '二', count: 45, isToday: false },
  { label: '三', count: 18, isToday: false },
  { label: '四', count: 37, isToday: false },
  { label: '五', count: 25, isToday: false },
  { label: '六', count: 50, isToday: false },
  { label: '日', count: 12, isToday: true }
]);

// 最大题目数
const maxCount = computed(() => {
  return Math.max(...weekData.value.map(item => item.count));
});

onMounted(() => {
  loadWeekData();

  // 检查是否需要打开练习页面
  const shouldOpenPractice = uni.getStorageSync('should_open_practice');
  if (shouldOpenPractice) {
    // 获取存储的练习参数
    const questionIds = uni.getStorageSync('sequential_question_ids');
    const practiceMode = uni.getStorageSync('practice_mode');
    const categoryId = uni.getStorageSync('category_id');
    const categoryName = uni.getStorageSync('category_name');

    // 清除标志避免重复跳转
    uni.removeStorageSync('should_open_practice');

    // 如果有有效的参数，则跳转到练习页面
    if (questionIds && practiceMode) {
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/practice/do?mode=${practiceMode}&category=${categoryId}&name=${encodeURIComponent(categoryName)}&ids=${questionIds}`
        });
      }, 300); // 延迟跳转，确保页面已完全加载
    }
  }
});

// 加载周数据
function loadWeekData() {
  // 实际应用中应该从API或本地存储获取
  const today = new Date().getDay(); // 0是周日，1-6是周一到周六
  
  // 更新今天标记
  weekData.value.forEach((day, index) => {
    // 转换index（在我们的数据中，0是周一，6是周日）
    // 而在getDay()中，0是周日，1-6是周一到周六
    let dayIndex = index + 1;
    if (dayIndex === 7) dayIndex = 0;
    
    day.isToday = (dayIndex === today);
  });
}

// 开始练习
function startPractice(mode) {
  // 直接使用 navigateTo 导航到 do.vue 页面
  // 这个不是 tabBar 页面跳转，所以可以使用 navigateTo
  uni.navigateTo({
    url: `/pages/practice/do?mode=${mode}`
  });
}

// 导航到分类题目
function navigateToCategory(id, name) {
  uni.navigateTo({
    url: `/pages/category/questions?id=${id}&name=${encodeURIComponent(name)}`
  });
}

// 通用导航
function navigateTo(url) {
  uni.navigateTo({ url });
}

// 处理底部导航变化
function handleTabChange(index) {
  // 仅供参考，由于使用了uni-app的tabBar配置，这里实际不需要处理
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 120rpx; /* 为底部TabBar留出空间 */
}

.header {
  padding: 40rpx 30rpx 20rpx;
  background: #fff;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.stats-card {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 30rpx 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-divider {
  width: 2rpx;
  background: #f0f0f0;
  margin: 0 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.practice-section, .category-section, .weekly-section {
  margin: 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.practice-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.practice-item {
  width: calc(33.33% - 20rpx);
  margin: 10rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.practice-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 40rpx;
  margin-bottom: 15rpx;
  font-size: 36rpx;
}

.random-icon {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.wrong-icon {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.daily-icon {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.favorite-icon {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.plan-icon {
  background: rgba(114, 46, 209, 0.1);
  color: #722ed1;
}

.exam-icon {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.practice-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 6rpx;
}

.practice-desc {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.category-scroll {
  white-space: nowrap;
  margin: 0 -10rpx;
}

.category-item {
  display: inline-block;
  width: 300rpx;
  height: 180rpx;
  margin: 10rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.category-bg {
  width: 100%;
  height: 100%;
}

.category-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
}

.category-info {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
}

.category-name {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.category-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200rpx;
  padding: 20rpx 0;
}

.weekly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80rpx;
}

.weekly-bar-container {
  height: 150rpx;
  display: flex;
  align-items: flex-end;
  margin-bottom: 10rpx;
}

.weekly-bar {
  width: 30rpx;
  background: #e6f7ff;
  border-radius: 15rpx;
}

.weekly-bar.today {
  background: #1890ff;
}

.weekly-day {
  font-size: 24rpx;
  color: #999;
}
</style>
