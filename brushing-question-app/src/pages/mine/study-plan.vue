<template>
  <view class="container">
    <!-- 顶部统计 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">{{ planStatistics.total }}</text>
        <text class="stats-label">计划总数</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ planStatistics.active }}</text>
        <text class="stats-label">进行中</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ planStatistics.completed }}</text>
        <text class="stats-label">已完成</text>
      </view>
    </view>
    
    <!-- 新建计划按钮 -->
    <view class="create-plan-btn" @tap="showCreatePlan">
      <text class="create-icon">+</text>
      <text>新建学习计划</text>
    </view>
    
    <!-- 进行中的计划 -->
    <view v-if="activePlans.length > 0" class="plan-section">
      <view class="section-header">
        <text class="section-title">进行中</text>
      </view>
      
      <view class="plan-list">
        <view 
          v-for="(plan, index) in activePlans" 
          :key="plan.id"
          class="plan-card"
          @tap="navigateToPlanDetail(plan.id)"
        >
          <view class="plan-header">
            <text class="plan-title">{{ plan.title }}</text>
            <text class="plan-days">{{ plan.days }}天计划</text>
          </view>
          
          <view class="plan-progress">
            <view class="progress-bar">
              <view 
                class="progress-inner"
                :style="{ width: `${plan.progress}%` }"
              ></view>
            </view>
            <text class="progress-text">{{ plan.progress }}%</text>
          </view>
          
          <view class="plan-footer">
            <view class="plan-info">
              <text class="plan-category">{{ plan.category }}</text>
              <text class="plan-date">{{ formatDate(plan.startDate) }} 开始</text>
            </view>
            <view class="plan-actions">
              <button class="action-btn continue-btn" @tap.stop="continuePlan(plan.id)">
                继续学习
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 历史计划 -->
    <view v-if="completedPlans.length > 0" class="plan-section">
      <view class="section-header">
        <text class="section-title">已完成</text>
      </view>
      
      <view class="plan-list">
        <view 
          v-for="(plan, index) in completedPlans" 
          :key="plan.id"
          class="plan-card completed"
          @tap="navigateToPlanDetail(plan.id)"
        >
          <view class="plan-header">
            <text class="plan-title">{{ plan.title }}</text>
            <text class="plan-badge">已完成</text>
          </view>
          
          <view class="plan-footer">
            <view class="plan-info">
              <text class="plan-category">{{ plan.category }}</text>
              <text class="plan-date">{{ formatDate(plan.endDate) }} 完成</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-if="!hasPlans" class="empty-state">
      <image class="empty-image" src="/static/images/empty-plan.png" mode="aspectFit"></image>
      <text class="empty-text">暂无学习计划</text>
      <text class="empty-tips">创建一个学习计划，坚持每日学习</text>
      <button class="empty-btn" @tap="showCreatePlan">立即创建</button>
    </view>
    
    <!-- 创建计划弹窗 -->
    <uni-popup ref="popup" type="center" :mask-click="false">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">创建学习计划</text>
          <text class="popup-close" @tap="hideCreatePlan">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">计划名称</text>
          <input 
            class="form-input" 
            type="text" 
            placeholder="请输入计划名称" 
            v-model="newPlan.title"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">学习分类</text>
          <picker
            mode="selector"
            :range="categories"
            range-key="name"
            @change="onCategoryChange"
          >
            <view class="picker">
              {{ selectedCategory ? selectedCategory.name : '请选择学习分类' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">计划天数</text>
          <slider 
            :min="1" 
            :max="30" 
            show-value 
            :value="newPlan.days" 
            @change="onDaysChange"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">每日题目数</text>
          <slider 
            :min="5" 
            :max="50" 
            :step="5"
            show-value 
            :value="newPlan.questionsPerDay" 
            @change="onQuestionsChange"
          />
        </view>
        
        <view class="form-buttons">
          <button class="form-btn cancel-btn" @tap="hideCreatePlan">取消</button>
          <button class="form-btn submit-btn" @tap="createPlan">创建</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuestionStore } from '@/store/question';
import { useUserStore } from '@/store/user';

const questionStore = useQuestionStore();
const userStore = useUserStore();

// 弹窗引用
const popup = ref(null);

// 计划统计
const planStatistics = ref({
  total: 0,
  active: 0,
  completed: 0
});

// 计划列表
const plans = ref([]);
const activePlans = computed(() => plans.value.filter(plan => plan.progress < 100));
const completedPlans = computed(() => plans.value.filter(plan => plan.progress === 100));

// 是否有计划
const hasPlans = computed(() => plans.value.length > 0);

// 新建计划
const newPlan = ref({
  title: '',
  categoryId: '',
  days: 7,
  questionsPerDay: 10
});

// 学习分类
const categories = ref([]);
const selectedCategory = ref(null);

onMounted(() => {
  loadPlans();
  loadCategories();
});

// 加载学习计划
async function loadPlans() {
  try {
    // 实际应用中从API获取计划数据
    // 这里使用模拟数据
    plans.value = [
      {
        id: '1',
        title: '前端基础强化',
        category: '前端开发',
        days: 7,
        questionsPerDay: 10,
        progress: 42,
        startDate: new Date('2023-09-10'),
        endDate: null
      },
      {
        id: '2',
        title: 'JavaScript进阶',
        category: '前端开发',
        days: 14,
        questionsPerDay: 15,
        progress: 23,
        startDate: new Date('2023-09-15'),
        endDate: null
      },
      {
        id: '3',
        title: '算法基础',
        category: '算法',
        days: 30,
        questionsPerDay: 5,
        progress: 100,
        startDate: new Date('2023-08-01'),
        endDate: new Date('2023-08-30')
      }
    ];
    
    // 更新统计
    updateStatistics();
  } catch (error) {
    console.error('加载学习计划失败:', error);
  }
}

// 加载分类
async function loadCategories() {
  try {
    // 实际应用中从API获取分类数据
    categories.value = [
      { id: 'frontend', name: '前端开发' },
      { id: 'backend', name: '后端开发' },
      { id: 'algorithm', name: '算法' },
      { id: 'database', name: '数据库' },
      { id: 'network', name: '计算机网络' }
    ];
  } catch (error) {
    console.error('加载分类失败:', error);
  }
}

// 更新计划统计数据
function updateStatistics() {
  planStatistics.value = {
    total: plans.value.length,
    active: activePlans.value.length,
    completed: completedPlans.value.length
  };
}

// 显示创建计划弹窗
function showCreatePlan() {
  resetNewPlan();
  popup.value.open();
}

// 隐藏创建计划弹窗
function hideCreatePlan() {
  popup.value.close();
}

// 重置新计划表单
function resetNewPlan() {
  newPlan.value = {
    title: '',
    categoryId: '',
    days: 7,
    questionsPerDay: 10
  };
  selectedCategory.value = null;
}

// 分类选择器变化
function onCategoryChange(e) {
  const index = e.detail.value;
  selectedCategory.value = categories.value[index];
  newPlan.value.categoryId = selectedCategory.value.id;
}

// 天数滑块变化
function onDaysChange(e) {
  newPlan.value.days = e.detail.value;
}

// 题目数滑块变化
function onQuestionsChange(e) {
  newPlan.value.questionsPerDay = e.detail.value;
}

// 创建计划
function createPlan() {
  if (!newPlan.value.title.trim()) {
    uni.showToast({
      title: '请输入计划名称',
      icon: 'none'
    });
    return;
  }
  
  if (!newPlan.value.categoryId) {
    uni.showToast({
      title: '请选择学习分类',
      icon: 'none'
    });
    return;
  }
  
  // 实际应用中应该发送到API创建计划
  const newPlanData = {
    id: Date.now().toString(),
    title: newPlan.value.title,
    category: selectedCategory.value.name,
    days: newPlan.value.days,
    questionsPerDay: newPlan.value.questionsPerDay,
    progress: 0,
    startDate: new Date(),
    endDate: null
  };
  
  plans.value.unshift(newPlanData);
  updateStatistics();
  
  hideCreatePlan();
  
  uni.showToast({
    title: '创建成功',
    icon: 'success'
  });
}

// 继续学习计划
function continuePlan(planId) {
  const plan = plans.value.find(p => p.id === planId);
  if (!plan) return;
  
  uni.navigateTo({
    url: `/pages/practice/do?mode=plan&planId=${planId}`
  });
}

// 导航到计划详情
function navigateToPlanDetail(planId) {
  uni.navigateTo({
    url: `/pages/mine/plan-detail?id=${planId}`
  });
}

// 格式化日期
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 20rpx;
}

.stats-card {
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  padding: 30rpx 0;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-divider {
  width: 2rpx;
  background: #f0f0f0;
  margin: 0 10rpx;
}

.stats-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stats-label {
  font-size: 26rpx;
  color: #999;
}

.create-plan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1890ff;
  color: #fff;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  margin-bottom: 30rpx;
}

.create-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.plan-section {
  margin-bottom: 30rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 20rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10rpx;
  width: 6rpx;
  height: 30rpx;
  background: #1890ff;
  border-radius: 3rpx;
}

.plan-list {
  display: flex;
  flex-direction: column;
}

.plan-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.plan-card.completed {
  background: #f9f9f9;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.plan-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.plan-days {
  font-size: 26rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.plan-badge {
  font-size: 26rpx;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.plan-progress {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 10rpx;
  background: #f0f0f0;
  border-radius: 5rpx;
  margin-right: 20rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 5rpx;
}

.progress-text {
  font-size: 26rpx;
  color: #1890ff;
  width: 60rpx;
  text-align: right;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info {
  display: flex;
  flex-direction: column;
}

.plan-category {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.plan-date {
  font-size: 24rpx;
  color: #999;
}

.plan-actions {
  display: flex;
}

.action-btn {
  border: none;
  background: none;
  font-size: 28rpx;
  padding: 0;
  line-height: 1.5;
}

.continue-btn {
  color: #1890ff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
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
  margin-bottom: 30rpx;
  text-align: center;
}

.empty-btn {
  background: #1890ff;
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
}

.popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
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

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  line-height: 80rpx;
  color: #333;
}

.form-buttons {
  display: flex;
  margin-top: 40rpx;
}

.form-btn {
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

.submit-btn {
  background: #1890ff;
  color: #fff;
}
</style> 