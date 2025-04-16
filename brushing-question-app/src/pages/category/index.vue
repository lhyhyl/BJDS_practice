<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索题目关键词" 
          v-model="searchText"
          @confirm="handleSearch"
        />
        <text v-if="searchText" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
    </view>
    
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
      <!-- 分类标签 -->
      <scroll-view scroll-x class="category-tabs">
        <view 
          v-for="(tab, index) in categoryTabs" 
          :key="index"
          class="tab-item"
          :class="{ active: activeTab === index }"
          @tap="switchTab(index)"
        >
          {{ tab.name }}
        </view>
      </scroll-view>
      
      <!-- 分类列表 -->
      <swiper class="category-swiper" :current="activeTab" @change="swiperChange">
        <swiper-item v-for="(tab, tabIndex) in categoryTabs" :key="tabIndex">
          <scroll-view scroll-y class="category-scroll">
            <!-- 热门推荐 -->
            <view class="hot-section" v-if="tabIndex === 0">
              <view class="section-title">热门推荐</view>
              <view class="hot-grid">
                <view 
                  v-for="(item, index) in hotCategories" 
                  :key="index"
                  class="hot-item"
                  @tap="navigateToQuestions(item.id, item.name)"
                  :style="{ backgroundColor: item.color }"
                >
                  <view class="hot-item-info">
                    <text class="hot-item-name">{{ item.name }}</text>
                    <text class="hot-item-count">{{ item.count }}题</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 分类列表 -->
            <view class="category-list">
              <view 
                v-for="(category, cIndex) in getCategoriesByTab(tabIndex)" 
                :key="cIndex"
                class="category-item"
                @tap="navigateToQuestions(category.id, category.name)"
              >
                <view class="category-icon" :style="{ background: category.color }">{{ category.icon }}</view>
                <view class="category-info">
                  <text class="category-name">{{ category.name }}</text>
                  <text class="category-desc">{{ category.count }}题 | {{ category.progress }}%已学</text>
                </view>
                <view class="progress-mini">
                  <view 
                    class="progress-mini-inner"
                    :style="{ width: `${category.progress}%` }"
                  ></view>
                </view>
                <text class="category-arrow">></text>
              </view>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { request } from '@/utils/request';
import { useQuestionStore } from '@/store/question';
import TabBar from '@/pages/tabbar.vue';

const questionStore = useQuestionStore();
const searchText = ref('');
const activeTab = ref(0);
const loading = ref(true);
const error = ref(null);

// 分类标签
const categoryTabs = [
  { name: '全部', type: 'all' },
  { name: '数据结构', type: 'datastructure' },
  { name: '操作系统', type: 'os' },
  { name: '计算机网络', type: 'network' },
  { name: '计算机组成', type: 'architecture' }
];

// 热门分类
const hotCategories = ref([]);

// 分类数据
const categories = ref([]);

// 根据标签获取分类
const getCategoriesByTab = (tabIndex) => {
  const type = categoryTabs[tabIndex].type;
  if (type === 'all') {
    return categories.value;
  }
  return categories.value.filter(item => item.type === type);
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 加载热门分类
    const hotRes = await request({
      url: '/api/subjects/hot',
      method: 'GET'
    });
    
    if (hotRes.data) {
      hotCategories.value = hotRes.data.map(item => ({
        id: item.id,
        name: item.name,
        count: item.questionCount,
        color: item.color || '#1890ff'
      }));
    }
    
    // 加载所有分类
    const categoryRes = await request({
      url: '/api/subjects',
      method: 'GET'
    });
    
    if (categoryRes.data) {
      categories.value = categoryRes.data.map(item => ({
        id: item.id,
        name: item.name,
        count: item.questionCount,
        progress: item.progress || 0,
        icon: item.icon || '题',
        color: item.color || 'rgba(24, 144, 255, 0.1)',
        type: item.type
      }));
    }
    
  } catch (err) {
    error.value = err.message;
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = async () => {
  if (!searchText.value.trim()) {
    loadData();
    return;
  }
  
  try {
    loading.value = true;
    const res = await request({
      url: '/api/questions/search',
      method: 'GET',
      data: {
        keyword: searchText.value
      }
    });
    
    if (res.data) {
      // 更新分类数据为搜索结果
      categories.value = res.data.map(item => ({
        id: item.id,
        name: item.title,
        count: 1,
        progress: 0,
        icon: '搜',
        color: 'rgba(24, 144, 255, 0.1)',
        type: 'search'
      }));
    }
  } catch (err) {
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 清空搜索
const clearSearch = () => {
  searchText.value = '';
  loadData();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
};

// 滑动切换
const swiperChange = (e) => {
  activeTab.value = e.detail.current;
};

// 导航到题目列表
const navigateToQuestions = (categoryId, categoryName) => {
  uni.navigateTo({
    url: `/pages/practice/do?mode=sequential&category=${categoryId}&name=${encodeURIComponent(categoryName)}`
  });
};

onMounted(() => {
  loadData();
});

// 添加TabBar处理函数
function handleTabChange(index) {
  // TabBar切换逻辑
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 100rpx;
  padding: 10rpx 30rpx;
}

.search-icon {
  margin-right: 15rpx;
  color: #999;
}

.search-input {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 28rpx;
}

.clear-icon {
  color: #ccc;
  padding: 10rpx;
}

.category-tabs {
  display: flex;
  white-space: nowrap;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  display: inline-block;
  padding: 20rpx 30rpx;
  font-size: 30rpx;
  color: #666;
}

.tab-item.active {
  color: #1890ff;
  font-weight: bold;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: #1890ff;
  border-radius: 3rpx;
}

.category-swiper {
  flex: 1;
}

.category-scroll {
  height: 100%;
  padding: 20rpx;
}

.hot-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.hot-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.hot-item {
  position: relative;
  width: calc(50% - 20rpx);
  height: 180rpx;
  margin: 10rpx;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 20rpx;
  box-sizing: border-box;
}

.hot-item-info {
  width: 100%;
}

.hot-item-name {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.hot-item-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.category-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
}

.category-item:last-child {
  border-bottom: none;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.category-desc {
  font-size: 24rpx;
  color: #999;
}

.progress-mini {
  width: 100rpx;
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  margin-right: 20rpx;
}

.progress-mini-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 3rpx;
}

.category-arrow {
  color: #ccc;
  font-size: 30rpx;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
}

.loading text {
  color: #999;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
}

.error text {
  color: #999;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.error button {
  background-color: #1890ff;
  color: #fff;
  border: none;
  padding: 10rpx 30rpx;
  border-radius: 8rpx;
}
</style> 