<script>
import { useQuestionStore } from '@/store/question';
import { useUserStore } from '@/store/user';

export default {
  onLaunch: async function() {
    console.log('App Launch');
    
    try {
      const questionStore = useQuestionStore();
      const userStore = useUserStore();
      
      await Promise.all([
        questionStore.init(),
        userStore.init()
      ]);
    } catch (error) {
      console.error('Store初始化失败:', error);
    }

    uni.addInterceptor('navigateTo', {
      invoke(params) {
        console.log('navigateTo拦截:', params.url);
        return params;
      },
      success(res) {
        console.log('navigateTo成功');
      },
      fail(err) {
        console.error('navigateTo失败:', err);
      }
    });

    uni.addInterceptor('switchTab', {
      invoke(params) {
        console.log('switchTab拦截:', params.url);
        return params;
      },
      success(res) {
        console.log('switchTab成功');
      },
      fail(err) {
        console.error('switchTab失败:', err);
      }
    });
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  }
};
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
}

/* 统一颜色变量 */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  --text-color: #333333;
  --text-color-secondary: #666666;
  --disabled-color: #999999;
  --border-color: #e8e8e8;
  --background-color: #f8f8f8;
}

.container {
  padding: 20rpx;
}

button {
  margin: 10rpx 0;
}
</style>
