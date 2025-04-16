<template>
  <view class="tab-bar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @tap="switchTab(index, item.url)"
    >
      <image :src="currentIndex === index ? item.selectedIcon : item.icon" class="tab-icon" />
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['change']);
const currentIndex = ref(0);

const tabList = [
  {
    text: '首页',
    url: '/pages/index/index',
    icon: '/static/images/home.png',
    selectedIcon: '/static/images/home-active.png'
  },
  {
    text: '分类',
    url: '/pages/category/index',
    icon: '/static/images/category.png',
    selectedIcon: '/static/images/category-active.png'
  },
  {
    text: '练习',
    url: '/pages/practice/index',
    icon: '/static/images/practice.png',
    selectedIcon: '/static/images/practice-active.png'
  },
  {
    text: '我的',
    url: '/pages/mine/index',
    icon: '/static/images/mine.png',
    selectedIcon: '/static/images/mine-active.png'
  }
];

function switchTab(index, url) {
  if (currentIndex.value === index) return;
  
  currentIndex.value = index;
  emit('change', index);
  
  uni.switchTab({
    url,
    fail: (err) => {
      console.error('switchTab失败:', err);
      // 如果switchTab失败，尝试使用navigateTo
      uni.navigateTo({
        url,
        fail: (navErr) => {
          console.error('navigateTo也失败:', navErr);
        }
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid var(--border-color);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  
  &.active {
    .tab-text {
      color: var(--primary-color);
    }
  }
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 24rpx;
  color: var(--text-color-secondary);
}
</style> 