<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-card">
      <image class="user-bg" src="/static/images/user-bg.jpg" mode="aspectFill"></image>
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
        <view class="user-details">
          <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
          <view class="user-badges">
            <view class="badge" v-if="userStore.statistics.streak >= 3">
              <text class="badge-icon">🔥</text>
              <text class="badge-text">{{ userStore.statistics.streak }}天连续刷题</text>
            </view>
            <view class="badge" v-if="userStore.statistics.totalQuestions >= 100">
              <text class="badge-icon">🏆</text>
              <text class="badge-text">刷题达人</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 数据概览 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.totalQuestions }}</text>
        <text class="stat-label">总答题</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.correctRate }}%</text>
        <text class="stat-label">正确率</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userStore.statistics.streak }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="function-list">
      <view class="function-group">
        <view class="function-item" @tap="navigateTo('/pages/practice/do?mode=wrong')">
          <view class="function-icon wrong-icon">📝</view>
          <view class="function-info">
            <text class="function-name">我的错题本</text>
            <text class="function-desc">查看和练习错题</text>
          </view>
          <text class="function-arrow">></text>
        </view>
        
        <view class="function-item" @tap="navigateTo('/pages/practice/do?mode=favorite')">
          <view class="function-icon favorite-icon">⭐</view>
          <view class="function-info">
            <text class="function-name">我的收藏</text>
            <text class="function-desc">收藏的题目</text>
          </view>
          <text class="function-arrow">></text>
        </view>
        
        <view class="function-item" @tap="navigateTo('/pages/mine/history')">
          <view class="function-icon history-icon">🕒</view>
          <view class="function-info">
            <text class="function-name">做题记录</text>
            <text class="function-desc">查看历史做题记录</text>
          </view>
          <text class="function-arrow">></text>
        </view>
      </view>
      
      <view class="function-group">
        <view class="function-item" @tap="navigateTo('/pages/mine/study-plan')">
          <view class="function-icon plan-icon">📊</view>
          <view class="function-info">
            <text class="function-name">学习计划</text>
            <text class="function-desc">制定和查看学习计划</text>
          </view>
          <text class="function-arrow">></text>
        </view>
        
        <view class="function-item" @tap="navigateTo('/pages/mine/notes')">
          <view class="function-icon notes-icon">📒</view>
          <view class="function-info">
            <text class="function-name">我的笔记</text>
            <text class="function-desc">个人学习笔记</text>
          </view>
          <text class="function-arrow">></text>
        </view>
      </view>
      
      <view class="function-group">
        <view class="function-item" @tap="navigateTo('/pages/mine/settings')">
          <view class="function-icon settings-icon">⚙️</view>
          <view class="function-info">
            <text class="function-name">设置</text>
            <text class="function-desc">应用设置</text>
          </view>
          <text class="function-arrow">></text>
        </view>
        
        <view class="function-item" @tap="navigateTo('/pages/mine/feedback')">
          <view class="function-icon feedback-icon">💬</view>
          <view class="function-info">
            <text class="function-name">意见反馈</text>
            <text class="function-desc">问题反馈与建议</text>
          </view>
          <text class="function-arrow">></text>
        </view>
        
        <view class="function-item" @tap="navigateTo('/pages/mine/about')">
          <view class="function-icon about-icon">ℹ️</view>
          <view class="function-info">
            <text class="function-name">关于我们</text>
            <text class="function-desc">应用信息</text>
          </view>
          <text class="function-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const userInfo = ref({
  nickname: '',
  avatar: ''
});

onMounted(() => {
  // 获取用户信息
  getUserInfo();
});

async function getUserInfo() {
  try {
    // 从存储或API获取用户信息
    const userInfoData = uni.getStorageSync('userInfo');
    if (userInfoData) {
      userInfo.value = JSON.parse(userInfoData);
    } else {
      // 未登录状态，可以展示默认信息或引导登录
      userInfo.value = {
        nickname: '未登录',
        avatar: '/static/images/default-avatar.png'
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 30rpx;
}

.user-card {
  position: relative;
  height: 300rpx;
  overflow: hidden;
}

.user-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  filter: blur(2px);
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  padding: 30rpx;
  z-index: 1;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid #fff;
}

.user-details {
  margin-left: 30rpx;
}

.nickname {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
}

.badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  padding: 6rpx 16rpx;
  margin-right: 20rpx;
  margin-top: 10rpx;
}

.badge-icon {
  margin-right: 8rpx;
}

.badge-text {
  font-size: 24rpx;
  color: #fff;
}

.stats-card {
  margin: -40rpx 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 30rpx 0;
  position: relative;
  z-index: 2;
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
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.function-list {
  padding: 0 20rpx;
}

.function-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.function-item:last-child {
  border-bottom: none;
}

.function-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12rpx;
  margin-right: 20rpx;
  font-size: 32rpx;
}

.wrong-icon {
  background: rgba(255, 76, 76, 0.1);
  color: #ff4c4c;
}

.favorite-icon {
  background: rgba(255, 184, 0, 0.1);
  color: #ffb800;
}

.history-icon {
  background: rgba(100, 148, 237, 0.1);
  color: #6494ed;
}

.plan-icon {
  background: rgba(144, 238, 144, 0.1);
  color: #52c41a;
}

.notes-icon {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

.settings-icon, .feedback-icon, .about-icon {
  background: rgba(189, 189, 189, 0.1);
  color: #999;
}

.function-info {
  flex: 1;
}

.function-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.function-desc {
  font-size: 24rpx;
  color: #999;
}

.function-arrow {
  color: #ccc;
  font-size: 30rpx;
}
</style>
