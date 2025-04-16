// 封装请求方法
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api.example.com";

// 不需要登录就可以访问的接口白名单
const whiteList = [
  '/api/user/login',
  '/api/user/send-code',
  '/api/user/register',
  '/api/user/auto-login',
  '/api/user/dev-login', // 开发环境模拟登录
  '/api/user/phone-login'
];

export const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync("token");
    const url = options.url;

    // 白名单外的接口在未登录状态下自动跳转到登录页
    if (!token && !whiteList.some((item) => url.includes(item))) {
      uni.navigateTo({ url: "/pages/login/index" });
      return reject(new Error("请先登录"));
    }

    uni.request({
      url: baseURL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "content-type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.header,
      },
      timeout: 10000, // 10秒超时
      withCredentials: true, // 允许跨域请求时携带cookie
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除token并跳转到登录
          uni.removeStorageSync("token");
          uni.removeStorageSync("userInfo");
          
          uni.showToast({
            title: "登录已过期，请重新登录",
            icon: "none",
          });

          setTimeout(() => {
            uni.navigateTo({ url: "/pages/login/index" });
          }, 1500);

          reject(new Error("请重新登录"));
        } else {
          uni.showToast({
            title: res.data.message || "请求失败",
            icon: "none",
          });
          reject(new Error(res.data.message || "请求失败"));
        }
      },
      fail: (err) => {
        uni.showToast({
          title: "网络异常",
          icon: "none",
        });
        reject(err);
      },
    });
  });
};
