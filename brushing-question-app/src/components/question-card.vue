<template>
  <view class="question-card">
    <view class="question-header">
      <text class="question-type">{{ typeText }}</text>
      <text class="question-number">#{{ index + 1 }}</text>
    </view>

    <view class="question-content">
      <text>{{ question.content }}</text>
    </view>

    <view class="options">
      <view
        v-for="option in question.options"
        :key="option.id"
        class="option-item"
        :class="{
          selected: isSelected(option.id),
          correct: showAnswer && option.isCorrect,
          wrong: showAnswer && isSelected(option.id) && !option.isCorrect,
        }"
        @tap="selectOption(option.id)"
      >
        <text class="option-label">{{ option.id }}</text>
        <text class="option-text">{{ option.text }}</text>
      </view>
    </view>

    <view v-if="showAnswer" class="analysis">
      <view class="analysis-title">答案解析</view>
      <text class="analysis-content">{{ question.analysis }}</text>
    </view>

    <view class="actions" v-if="!showAnswer">
      <button class="submit-btn" :disabled="!canSubmit" @tap="submit">
        提交答案
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定义 props
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  showAnswer: {
    type: Boolean,
    default: false,
  },
});

// 定义 emits
const emit = defineEmits(['submit']);

// 响应式数据
const selectedOptions = ref([]);

// 计算属性
const typeText = computed(() => {
  const types = {
    single: "单选题",
    multiple: "多选题",
    judge: "判断题",
  };
  return types[props.question.type] || "未知题型";
});

const canSubmit = computed(() => {
  if (props.question.type === "multiple") {
    return selectedOptions.value.length > 0;
  }
  return selectedOptions.value.length === 1;
});

// 方法
function isSelected(optionId) {
  return selectedOptions.value.includes(optionId);
}

function selectOption(optionId) {
  if (props.showAnswer) return;

  if (props.question.type === "single" || props.question.type === "judge") {
    selectedOptions.value = [optionId];
  } else {
    const index = selectedOptions.value.indexOf(optionId);
    if (index === -1) {
      selectedOptions.value.push(optionId);
    } else {
      selectedOptions.value.splice(index, 1);
    }
  }
}

function submit() {
  if (!canSubmit.value) return;
  emit('submit', {
    questionId: props.question.id,
    answers: selectedOptions.value,
  });
}
</script>

<style>
.question-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.question-type {
  color: #666;
  font-size: 28rpx;
}

.question-number {
  color: #999;
  font-size: 28rpx;
}

.question-content {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.options {
  margin-bottom: 30rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.option-item.selected {
  background: #e6f7ff;
  border-color: #1890ff;
}

.option-item.correct {
  background: #f6ffed;
  border-color: #52c41a;
}

.option-item.wrong {
  background: #fff1f0;
  border-color: #ff4d4f;
}

.option-label {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 30rpx;
  background: #f5f5f5;
  margin-right: 20rpx;
}

.analysis {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.analysis-title {
  font-weight: bold;
  margin-bottom: 10rpx;
}

.submit-btn {
  background: #1890ff;
  color: #fff;
  border-radius: 8rpx;
}
</style>
