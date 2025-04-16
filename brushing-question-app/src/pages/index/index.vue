<template>
  <view class="container">
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
    
    <!-- 错误提示 -->
    <view class="error" v-else-if="error">
      <text>{{ error }}</text>
      <button @click="loadData">重试</button>
    </view>
    
    <!-- 正常内容 -->
    <template v-else>
      <!-- 热门分类 -->
      <view class="hot-categories">
        <view class="section-title">热门分类</view>
        <scroll-view scroll-x class="category-scroll">
          <view class="category-list">
            <view 
              v-for="(category, index) in categories" 
              :key="index"
              class="category-item"
              :style="{ backgroundColor: category.color }"
              @click="navigateToCategory(category.id)"
            >
              <text class="category-name">{{ category.name }}</text>
              <text class="category-count">{{ category.count }}题</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 练习模式 -->
      <view class="practice-modes">
        <view class="section-title">练习模式</view>
        <view class="mode-grid">
          <view 
            v-for="(mode, index) in practiceModes" 
            :key="index"
            class="mode-item"
            @click="startPractice(mode.type)"
          >
            <image :src="mode.icon" class="mode-icon"></image>
            <text class="mode-name">{{ mode.name }}</text>
            <text class="mode-desc">{{ mode.description }}</text>
          </view>
        </view>
      </view>

      <!-- 每日一题 -->
      <view class="daily-question">
        <view class="section-title">每日一题</view>
        <view class="question-card" @click="startDailyQuestion">
          <view class="question-header">
            <text class="question-type">{{ dailyQuestion?.type || '单选题' }}</text>
            <text class="question-difficulty">{{ dailyQuestion?.difficulty || '中等' }}</text>
          </view>
          <view class="question-content">
            <text class="question-text">{{ dailyQuestion?.content || '今日题目加载中...' }}</text>
          </view>
          <view class="question-footer">
            <text class="answer-btn">开始答题</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const dailyQuestion = ref(null);

// 热门分类数据
const categories = ref([
  { id: 1, name: '数据结构', count: 100, color: '#1890ff' },
  { id: 2, name: '操作系统', count: 80, color: '#52c41a' },
  { id: 3, name: '计算机网络', count: 120, color: '#722ed1' },
  { id: 4, name: '计算机组成', count: 90, color: '#fa8c16' }
]);

// 练习模式数据
const practiceModes = ref([
  {
    type: 'sequential',
    name: '顺序练习',
    description: '按章节顺序练习',
    icon: '/static/icons/sequential.png'
  },
  {
    type: 'random',
    name: '随机练习',
    description: '随机抽取题目练习',
    icon: '/static/icons/random.png'
  },
  {
    type: 'wrong',
    name: '错题本',
    description: '复习做错的题目',
    icon: '/static/icons/wrong.png'
  },
  {
    type: 'favorite',
    name: '收藏夹',
    description: '查看收藏的题目',
    icon: '/static/icons/favorite.png'
  }
]);

const loading = ref(true);
const error = ref(null);

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 加载分类数据
    const categoryRes = await request({
      url: '/api/subjects',
      method: 'GET'
    });
    
    if (categoryRes.code === 0 && categoryRes.data) {
      categories.value = categoryRes.data.map(item => ({
        id: item.id,
        name: item.name,
        count: item.questionCount || 0,
        color: item.color || '#1890ff'
      }));
    }
    
    // 加载每日一题
    const dailyRes = await request({
      url: '/api/questions/daily',
      method: 'GET'
    });
    console.log('每日一题响应:', dailyRes);
    
    if (dailyRes.code === 0 && dailyRes.data) {
      dailyQuestion.value = dailyRes.data;
    } else {
      console.error('每日一题返回格式不符:', dailyRes);
    }
    
    // 若已登录，加载用户统计数据
    const token = uni.getStorageSync('token');
    if (token) {
      try {
        const statsRes = await request({
          url: '/api/statistics',
          method: 'GET'
        });

        if (statsRes.code === 0 && statsRes.data) {
          // 更新store中的统计数据
          userStore.statistics = {
            totalQuestions: statsRes.data.totalQuestions || 0,
            correctQuestions: statsRes.data.correctCount || 0,
            correctRate: statsRes.data.correctRate || 0,
            streak: statsRes.data.streak || 0
          };
          userStore.saveStatistics();
        }
      } catch (err) {
        console.error('获取用户统计数据失败:', err);
      }
    }
  } catch (err) {
    console.error('加载数据失败:', err);
    error.value = err.message || '加载失败，请检查网络';
  } finally {
    loading.value = false;
  }
};

// 导航到分类页面
const navigateToCategory = (categoryId) => {
  uni.navigateTo({
    url: `/pages/category/index?id=${categoryId}`
  });
};

// 开始练习
const startPractice = (mode) => {
  if (mode === 'sequential') {
    uni.navigateTo({
      url: '/pages/category/index'
    });
  } else {
    uni.navigateTo({
      url: `/pages/practice/do?mode=${mode}`
    });
  }
};

// 开始每日一题
const startDailyQuestion = () => {
  uni.navigateTo({
    url: '/pages/practice/do?mode=daily'
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 20rpx 0;
  color: #333;
}

// 热门分类样式
.hot-categories {
  margin-bottom: 30rpx;
  
  .category-scroll {
    white-space: nowrap;
    width: 100%;
  }
  
  .category-list {
    display: inline-flex;
    padding: 10rpx 0;
  }
  
  .category-item {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 200rpx;
    height: 160rpx;
    margin-right: 20rpx;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .category-name {
      font-size: 28rpx;
      color: #fff;
      margin-bottom: 10rpx;
    }
    
    .category-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 练习模式样式
.practice-modes {
  margin-bottom: 30rpx;
  
  .mode-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }
  
  .mode-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .mode-icon {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 20rpx;
    }
    
    .mode-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .mode-desc {
      font-size: 24rpx;
      color: #666;
    }
  }
}

// 每日一题样式
.daily-question {
  .question-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .question-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .question-type {
        font-size: 24rpx;
        color: #1890ff;
        background-color: rgba(24, 144, 255, 0.1);
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
      
      .question-difficulty {
        font-size: 24rpx;
        color: #fa8c16;
        background-color: rgba(250, 140, 22, 0.1);
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
    
    .question-content {
      margin-bottom: 30rpx;
      
      .question-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
      }
    }
    
    .question-footer {
      display: flex;
      justify-content: flex-end;
      
      .answer-btn {
        font-size: 28rpx;
        color: #1890ff;
        padding: 10rpx 30rpx;
        border: 2rpx solid #1890ff;
        border-radius: 30rpx;
      }
    }
  }
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  
  text {
    color: #999;
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }
  
  button {
    background-color: #1890ff;
    color: #fff;
    border: none;
    padding: 10rpx 30rpx;
    border-radius: 8rpx;
  }
}
</style>
