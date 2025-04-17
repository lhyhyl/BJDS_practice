<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-title">{{ categoryName }}</view>
      <view class="nav-actions">
        <view class="action-item" @tap="toggleMode">
          <text class="action-icon">{{ isListMode ? '⊞' : '≡' }}</text>
        </view>
        <view class="action-item" @tap="showFilterPopup">
          <text class="action-icon">⟁</text>
        </view>
      </view>
    </view>
    
    <!-- 筛选标签 -->
    <scroll-view scroll-x class="filter-tabs">
      <view 
        v-for="(tab, index) in difficultyTabs" 
        :key="index"
        class="filter-tab"
        :class="{ active: activeDifficulty === tab.value }"
        @tap="setDifficultyFilter(tab.value)"
      >
        {{ tab.label }}
      </view>
    </scroll-view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 空状态 -->
    <view v-else-if="filteredQuestions.length === 0" class="empty-state">
      <image class="empty-image" src="/static/images/empty-list.png" mode="aspectFit"></image>
      <text class="empty-text">没有找到符合条件的题目</text>
      <text class="empty-tips">可以尝试调整筛选条件</text>
    </view>
    
    <!-- 列表模式 -->
    <scroll-view 
      v-else-if="isListMode" 
      scroll-y 
      class="questions-list"
      @scrolltolower="loadMoreQuestions"
    >
      <view 
        v-for="(question, index) in filteredQuestions" 
        :key="question.id"
        class="question-item"
        @tap="navigateToQuestion(question.id)"
      >
        <view class="question-header">
          <view class="question-type" :class="`type-${question.type}`">
            {{ getQuestionType(question.type) }}
          </view>
          <view class="question-difficulty">
            <text 
              v-for="i in 5" 
              :key="i" 
              class="difficulty-dot"
              :class="{ active: i <= question.difficulty }"
            ></text>
          </view>
        </view>
        <view class="question-content">
          <text class="question-title">{{ question.content }}</text>
        </view>
        <view class="question-footer">
          <view class="question-status" :class="{ 'status-done': question.isDone }">
            {{ question.isDone ? '已完成' : '未完成' }}
          </view>
          <view class="question-arrow">></view>
        </view>
      </view>
      
      <view v-if="hasMoreQuestions" class="load-more">
        <text class="load-more-text">加载更多...</text>
      </view>
      <view v-else class="load-more">
        <text class="load-more-text">没有更多题目了</text>
      </view>
    </scroll-view>
    
    <!-- 网格模式 -->
    <scroll-view 
      v-else 
      scroll-y 
      class="questions-grid"
      @scrolltolower="loadMoreQuestions"
    >
      <view class="grid-container">
        <view 
          v-for="(question, index) in filteredQuestions" 
          :key="question.id"
          class="grid-item"
          :class="{ 'done': question.isDone }"
          @tap="navigateToQuestion(question.id)"
        >
          <text class="grid-item-number">{{ index + 1 }}</text>
          <view v-if="question.isDone" class="done-icon">✓</view>
        </view>
      </view>
      
      <view v-if="hasMoreQuestions" class="load-more">
        <text class="load-more-text">加载更多...</text>
      </view>
      <view v-else class="load-more">
        <text class="load-more-text">没有更多题目了</text>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button 
        class="action-button start-btn" 
        @tap="startRandomQuestions"
      >
        随机练习
      </button>
      <button 
        class="action-button sequential-btn" 
        @tap="startSequentialQuestions"
      >
        顺序练习
      </button>
    </view>
    
    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选</text>
          <text class="popup-close" @tap="hideFilterPopup">✕</text>
        </view>
        
        <view class="filter-section">
          <view class="filter-title">题目类型</view>
          <view class="filter-options">
            <view 
              v-for="(type, index) in typeOptions" 
              :key="index"
              class="filter-option"
              :class="{ selected: selectedTypes.includes(type.value) }"
              @tap="toggleTypeFilter(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>
        
        <view class="filter-section">
          <view class="filter-title">难度级别</view>
          <view class="filter-options">
            <view 
              v-for="(level, index) in difficultyOptions" 
              :key="index"
              class="filter-option"
              :class="{ selected: selectedDifficulties.includes(level.value) }"
              @tap="toggleDifficultyFilter(level.value)"
            >
              {{ level.label }}
            </view>
          </view>
        </view>
        
        <view class="filter-section">
          <view class="filter-title">完成状态</view>
          <view class="filter-options">
            <view 
              v-for="(status, index) in statusOptions" 
              :key="index"
              class="filter-option"
              :class="{ selected: selectedStatus === status.value }"
              @tap="setStatusFilter(status.value)"
            >
              {{ status.label }}
            </view>
          </view>
        </view>
        
        <view class="filter-buttons">
          <button class="filter-btn reset-btn" @tap="resetFilters">重置</button>
          <button class="filter-btn apply-btn" @tap="applyFilters">应用</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useQuestionStore } from '@/store/question';

const questionStore = useQuestionStore();
const categoryId = ref('');
const categoryName = ref('');
const questions = ref([]);
const loading = ref(true);
const page = ref(1);
const pageSize = ref(20);
const hasMoreQuestions = ref(true);

// 显示模式
const isListMode = ref(true);

// 筛选相关
const filterPopup = ref(null);
const activeDifficulty = ref(0);
const selectedTypes = ref(['single', 'multiple', 'judge']);
const selectedDifficulties = ref([1, 2, 3, 4, 5]);
const selectedStatus = ref('all');

// 筛选标签
const difficultyTabs = [
  { label: '全部', value: 0 },
  { label: '简单', value: 1 },
  { label: '中等', value: 3 },
  { label: '困难', value: 5 }
];

// 筛选选项
const typeOptions = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '判断题', value: 'judge' }
];

const difficultyOptions = [
  { label: '入门', value: 1 },
  { label: '初级', value: 2 },
  { label: '中级', value: 3 },
  { label: '高级', value: 4 },
  { label: '专家', value: 5 }
];

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'done' },
  { label: '未完成', value: 'undone' }
];

// 筛选后的题目
const filteredQuestions = computed(() => {
  return questions.value.filter(question => {
    // 类型筛选
    if (!selectedTypes.value.includes(question.type)) {
      return false;
    }
    
    // 难度筛选（快捷标签）
    if (activeDifficulty.value !== 0) {
      if (activeDifficulty.value === 1 && question.difficulty > 2) return false;
      if (activeDifficulty.value === 3 && (question.difficulty < 3 || question.difficulty > 4)) return false;
      if (activeDifficulty.value === 5 && question.difficulty < 5) return false;
    }
    
    // 高级难度筛选
    if (!selectedDifficulties.value.includes(question.difficulty)) {
      return false;
    }
    
    // 状态筛选
    if (selectedStatus.value === 'done' && !question.isDone) {
      return false;
    }
    if (selectedStatus.value === 'undone' && question.isDone) {
      return false;
    }
    
    return true;
  });
});

// 加载页面参数
onLoad((options) => {
  if (options.id) {
    categoryId.value = options.id;
  }
  
  if (options.name) {
    categoryName.value = decodeURIComponent(options.name);
  }
  
  loadQuestions();
});

// 加载题目数据
async function loadQuestions() {
  loading.value = true;
  
  try {
    const data = await questionStore.getQuestionsByCategory(
      categoryId.value, 
      page.value, 
      pageSize.value
    );
    
    questions.value = [...questions.value, ...data.questions];
    hasMoreQuestions.value = data.hasMore;
  } catch (error) {
    console.error('加载题目失败:', error);
    uni.showToast({
      title: '加载题目失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 加载更多题目
function loadMoreQuestions() {
  if (!hasMoreQuestions.value || loading.value) return;
  
  page.value++;
  loadQuestions();
}

// 切换显示模式
function toggleMode() {
  isListMode.value = !isListMode.value;
}

// 显示筛选弹窗
function showFilterPopup() {
  filterPopup.value.open();
}

// 隐藏筛选弹窗
function hideFilterPopup() {
  filterPopup.value.close();
}

// 设置难度筛选（快捷标签）
function setDifficultyFilter(difficulty) {
  activeDifficulty.value = difficulty;
}

// 切换类型筛选
function toggleTypeFilter(type) {
  const index = selectedTypes.value.indexOf(type);
  if (index === -1) {
    selectedTypes.value.push(type);
  } else {
    if (selectedTypes.value.length > 1) { // 保证至少选择一个类型
      selectedTypes.value.splice(index, 1);
    }
  }
}

// 切换难度筛选
function toggleDifficultyFilter(difficulty) {
  const index = selectedDifficulties.value.indexOf(difficulty);
  if (index === -1) {
    selectedDifficulties.value.push(difficulty);
  } else {
    if (selectedDifficulties.value.length > 1) { // 保证至少选择一个难度
      selectedDifficulties.value.splice(index, 1);
    }
  }
}

// 设置状态筛选
function setStatusFilter(status) {
  selectedStatus.value = status;
}

// 重置筛选
function resetFilters() {
  selectedTypes.value = ['single', 'multiple', 'judge'];
  selectedDifficulties.value = [1, 2, 3, 4, 5];
  selectedStatus.value = 'all';
  activeDifficulty.value = 0;
}

// 应用筛选
function applyFilters() {
  hideFilterPopup();
}

// 开始随机练习
function startRandomQuestions() {
  const ids = filteredQuestions.value.map(q => q.id);
  if (ids.length === 0) {
    uni.showToast({
      title: '没有可用的题目',
      icon: 'none'
    });
    return;
  }
  
  uni.navigateTo({
    url: `/pages/practice/do?mode=random&ids=${ids.join(',')}`
  });
}

// 开始顺序练习
function startSequentialQuestions() {
  const ids = filteredQuestions.value.map(q => q.id);
  if (ids.length === 0) {
    uni.showToast({
      title: '没有可用的题目',
      icon: 'none'
    });
    return;
  }
  
  // 存储题目ID到本地存储，以便practice/do页面读取
  uni.setStorageSync('sequential_question_ids', JSON.stringify(ids));
  uni.setStorageSync('practice_mode', 'sequential');
  uni.setStorageSync('category_id', categoryId.value);
  uni.setStorageSync('category_name', categoryName.value);
  
  // 使用switchTab跳转到练习页面
  uni.switchTab({
    url: '/pages/practice/index',
    success: () => {
      // 设置一个标志，让practice/index页面知道需要打开练习页面
      uni.setStorageSync('should_open_practice', true);
    }
  });
}

// 导航到题目
function navigateToQuestion(questionId) {
  uni.navigateTo({
    url: `/pages/practice/do?mode=single&questionId=${questionId}`
  });
}

// 获取题目类型文本
function getQuestionType(type) {
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

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-actions {
  display: flex;
}

.action-item {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 20rpx;
}

.action-icon {
  font-size: 40rpx;
  color: #666;
}

.filter-tabs {
  display: flex;
  white-space: nowrap;
  background: #fff;
  padding: 15rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-tab {
  display: inline-block;
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

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.empty-tips {
  font-size: 28rpx;
  color: #999;
}

.questions-list {
  flex: 1;
  padding: 20rpx;
}

.question-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.question-type {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
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

.question-content {
  margin-bottom: 15rpx;
}

.question-title {
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

.question-status {
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.status-done {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.question-arrow {
  color: #ccc;
  font-size: 30rpx;
}

.questions-grid {
  flex: 1;
  padding: 20rpx;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
}

.grid-item {
  width: calc(20% - 20rpx);
  height: 100rpx;
  margin: 10rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.grid-item.done {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.grid-item-number {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.done-icon {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  background: #52c41a;
  color: #fff;
  width: 30rpx;
  height: 30rpx;
  line-height: 30rpx;
  text-align: center;
  border-radius: 15rpx;
  font-size: 20rpx;
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
}

.load-more-text {
  font-size: 28rpx;
  color: #999;
}

.bottom-bar {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.action-button {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}

.start-btn {
  background: #1890ff;
  color: #fff;
}

.sequential-btn {
  background: #52c41a;
  color: #fff;
}

.filter-popup {
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 30rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-close {
  padding: 10rpx;
  color: #999;
  font-size: 32rpx;
}

.filter-section {
  margin-bottom: 30rpx;
}

.filter-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
}

.filter-option {
  padding: 15rpx 30rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.filter-option.selected {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.filter-buttons {
  display: flex;
  margin-top: 40rpx;
}

.filter-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

.apply-btn {
  background: #1890ff;
  color: #fff;
}
</style> 