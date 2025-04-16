<template>
    <view class="login-container">
        <view class="login-header">
            <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
            <text class="title">刷题小程序</text>
            <text class="subtitle">一键登录开始学习之旅</text>
        </view>

        <view class="login-form">
            <button class="auto-login-btn" :loading="autoLoginLoading" @click="handleAutoLogin">
                一键登录(本机号码)
            </button>

            <text class="agreement">
                登录即代表您已同意
                <text class="link" @click="showAgreement('user')">《用户协议》</text>
                和
                <text class="link" @click="showAgreement('privacy')">《隐私政策》</text>
            </text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const autoLoginLoading = ref(false);

// 检查登录状态
onMounted(() => {
    // 检查是否已登录
    const token = uni.getStorageSync('token');
    if (token) {
        navigateToMain();
    }
});

// 自动一键登录
const handleAutoLogin = async () => {
    try {
        autoLoginLoading.value = true;

        // 获取系统信息，检查平台
        const systemInfo = uni.getSystemInfoSync();
        console.log('系统信息:', systemInfo);

        // 一键登录仅支持APP环境
        // #ifdef APP-PLUS
        uni.login({
            provider: 'univerify',
            success: async (loginRes) => {
                console.log('一键登录成功:', loginRes);
                if (loginRes.authResult) {
                    try {
                        // 调用后端自动登录接口
                        const res = await request({
                            url: '/api/user/auto-login',
                            method: 'POST',
                            data: {
                                authResult: loginRes.authResult
                            }
                        });

                        if (res.code === 0 && res.data && res.data.token) {
                            // 保存登录信息
                            handleLoginSuccess(res.data);
                        } else {
                            uni.showToast({
                                title: res.message || '自动登录失败',
                                icon: 'none'
                            });
                        }
                    } catch (error) {
                        console.error('自动登录请求失败', error);
                        uni.showToast({
                            title: '登录失败，请稍后重试',
                            icon: 'none'
                        });
                    }
                }
            },
            fail: (err) => {
                console.error('一键登录失败', err);
                uni.showToast({
                    title: '获取本机号码失败，请重试',
                    icon: 'none'
                });
            }
        });
        // #endif

        // 非APP环境使用模拟登录（仅开发环境）
        // #ifndef APP-PLUS
        if (process.env.NODE_ENV === 'development') {
            // 开发环境模拟登录
            uni.showToast({
                title: '当前环境不支持一键登录，使用模拟登录',
                icon: 'none',
                duration: 2000
            });

            setTimeout(() => {
                // 调用后端模拟登录接口
                request({
                    url: '/api/user/dev-login',
                    method: 'POST',
                    data: {
                        deviceId: 'dev_' + Date.now()
                    }
                }).then(res => {
                    if (res.code === 0 && res.data) {
                        handleLoginSuccess(res.data);
                    } else {
                        uni.showToast({
                            title: '模拟登录失败',
                            icon: 'none'
                        });
                    }
                }).catch(err => {
                    console.error('模拟登录失败', err);
                });
            }, 1000);
        } else {
            uni.showToast({
                title: '请在APP中使用一键登录',
                icon: 'none'
            });
        }
        // #endif
    } catch (error) {
        console.error('自动登录失败', error);
        uni.showToast({
            title: '登录失败，请稍后重试',
            icon: 'none'
        });
    } finally {
        autoLoginLoading.value = false;
    }
};

// 处理登录成功
const handleLoginSuccess = (data) => {
    // 保存token
    uni.setStorageSync('token', data.token);
    // 保存用户信息
    userStore.setUserInfo(data.userInfo);

    // 显示登录成功提示
    uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
    });

    // 延迟跳转到首页
    setTimeout(() => {
        navigateToMain();
    }, 1500);
};

// 跳转到主页
const navigateToMain = () => {
    uni.switchTab({
        url: '/pages/index/index'
    });
};

// 显示协议
const showAgreement = (type) => {
    uni.navigateTo({
        url: `/pages/agreement/index?type=${type}`
    });
};
</script>

<style lang="scss">
.login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0 40rpx;
    background-color: #fff;
}

.login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 120rpx;
    margin-bottom: 80rpx;

    .logo {
        width: 150rpx;
        height: 150rpx;
        margin-bottom: 30rpx;
    }

    .title {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
    }

    .subtitle {
        font-size: 28rpx;
        color: #999;
    }
}

.login-form {
    display: flex;
    flex-direction: column;
    margin-top: 60rpx;

    .auto-login-btn {
        height: 90rpx;
        line-height: 90rpx;
        background-color: #13c2c2;
        color: #fff;
        font-size: 32rpx;
        border-radius: 45rpx;
        margin-top: 20rpx;
        text-align: center;
        box-shadow: 0 4rpx 12rpx rgba(19, 194, 194, 0.2);

        &:active {
            opacity: 0.9;
        }
    }

    .agreement {
        font-size: 24rpx;
        color: #999;
        margin-top: 40rpx;
        text-align: center;

        .link {
            color: #13c2c2;
        }
    }
}
</style>