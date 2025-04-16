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
          v-model="keyword"
          @confirm="handleSearch"
          :focus="true"
        />
        <text v-if="keyword" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
      <text class="cancel-btn" @tap="goBack">取消</text>
    </view>
    
    <!-- 搜索结果 -->
    <view v-if="loading" class="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在搜索...</text>
    </view>
    
    <view v-else-if="!hasResults" class="no-results">
      <image class="no-results-image" src="/static/images/no-result.png" mode="aspectFit"></image>
      <text class="no-results-text">未找到匹配的题目</text>
      <text class="no-results-tips">试试其他关键词或浏览分类</text>
    </view>
    
    <scroll-view v-else scroll-y class="results-scroll">
      <view class="results-header">
        <text class="results-count">找到 {{ searchResults.length }} 个结果</text>
        <view class="filter-tabs">
          <text 
            class="filter-tab" 
            :class="{ active: activeFilter === 'all' }"
            @tap="setFilter('all')"
          >全部</text>
          <text 
            class="filter-tab" 
            :class="{ active: activeFilter === 'single' }"
            @tap="setFilter('single')"
          >单选题</text>
          <text 
            class="filter-tab" 
            :class="{ active: activeFilter === 'multiple' }"
            @tap="setFilter('multiple')"
          >多选题</text>
          <text 
            class="filter-tab" 
            :class="{ active: activeFilter === 'judge' }"
            @tap="setFilter('judge')"
          >判断题</text>
        </view>
      </view>
      
      <view class="question-list">
        <view 
          v-for="(question, index) in filteredResults" 
          :key="question.id"
          class="question-item"
          @tap="navigateToQuestion(question.id)"
        >
          <view class="question-type-tag" :class="`type-${question.type}`">
            {{ getQuestionTypeLabel(question.type) }}
          </view>
          <view class="question-content">
            <text class="question-text">{{ question.content }}</text>
          </view>
          <view class="question-footer">
            <view class="question-category">{{ question.category }}</view>
            <view class="question-difficulty">
              <text 
                v-for="i in 5" 
                :key="i" 
                class="difficulty-dot"
                :class="{ active: i <= question.difficulty }"
              ></text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useQuestionStore } from '@/store/question';

const questionStore = useQuestionStore();
const keyword = ref('');
const loading = ref(true);
const searchResults = ref([]);
const activeFilter = ref('all');

// 是否有搜索结果
const hasResults = computed(() => {
  return searchResults.value.length > 0;
});

// 根据筛选显示的结果
const filteredResults = computed(() => {
  if (activeFilter.value === 'all') {
    return searchResults.value;
  }
  
  return searchResults.value.filter(question => question.type === activeFilter.value);
});

// 加载页面参数
onLoad((options) => {
  if (options.keyword) {
    keyword.value = decodeURIComponent(options.keyword);
    search(keyword.value);
  } else {
    loading.value = false;
  }
});

// 执行搜索
async function search(text) {
  if (!text.trim()) return;
  
  loading.value = true;
  
  try {
    const results = await questionStore.searchQuestions(text);
    searchResults.value = results;
  } catch (error) {
    console.error('搜索失败:', error);
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 处理搜索
function handleSearch() {
  search(keyword.value);
}

// 清除搜索
function clearSearch() {
  keyword.value = '';
  searchResults.value = [];
}

// 设置筛选
function setFilter(filter) {
  activeFilter.value = filter;
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 导航到题目详情
function navigateToQuestion(questionId) {
  uni.navigateTo({
    url: `/pages/practice/do?mode=single&questionId=${questionId}`
  });
}

// 获取题目类型标签
function getQuestionTypeLabel(type) {
  const types = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题'
  };
  return types[type] || '未知类型';
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
  display: flex;
  align-items: center;
}

.search-box {
  flex: 1;
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

.cancel-btn {
  padding: 0 20rpx;
  color: #666;
  font-size: 28rpx;
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

.no-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.no-results-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.no-results-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.no-results-tips {
  font-size: 28rpx;
  color: #999;
}

.results-scroll {
  flex: 1;
}

.results-header {
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.results-count {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

.filter-tabs {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-tab {
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  margin-right: 20rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
}

.filter-tab.active {
  background: #e6f7ff;
  color: #1890ff;
}

.question-list {
  padding: 20rpx;
}

.question-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.question-type-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  margin-bottom: 15rpx;
}

.type-single {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.type-multiple {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.type-judge {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.question-content {
  margin-bottom: 15rpx;
}

.question-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-category {
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.question-difficulty {
  display: flex;
}

.difficulty-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: #e8e8e8;
  margin-left: 6rpx;
}

.difficulty-dot.active {
  background: #ff9500;
}
</style> 