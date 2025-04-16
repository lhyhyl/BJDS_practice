/**
 * 一键登录认证服务
 * 用于处理与运营商一键登录SDK的交互
 */

const axios = require("axios");
const crypto = require("crypto");

class UniverifyService {
  /**
   * 获取手机号码
   * @param {string} authResult - 认证结果
   * @returns {Promise<{phone: string}>} - 返回手机号码
   */
  static async getPhoneNumber(authResult) {
    try {
      // 这里的实现需要根据具体使用的运营商SDK来调整
      // 以下是一个示例实现，实际项目中需要替换为真实的SDK调用

      // 1. 验证authResult的格式
      if (!authResult || typeof authResult !== "string") {
        throw new Error("无效的认证结果");
      }

      // 2. 准备请求参数
      // 以中国移动/联通/电信为例，请替换为实际使用的SDK参数
      const apiKey = process.env.UNIVERIFY_API_KEY;
      const apiSecret = process.env.UNIVERIFY_API_SECRET;
      const apiUrl = process.env.UNIVERIFY_API_URL;

      if (!apiKey || !apiSecret || !apiUrl) {
        throw new Error("缺少运营商SDK配置");
      }

      // 3. 生成签名（根据实际SDK要求调整）
      const timestamp = Date.now();
      const nonce = crypto.randomBytes(16).toString("hex");
      const signString = `key=${apiKey}&nonce=${nonce}&timestamp=${timestamp}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(signString)
        .digest("hex");

      // 4. 发送请求到运营商API
      const response = await axios.post(
        apiUrl,
        {
          authResult,
          timestamp,
          nonce,
          signature,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      // 5. 解析响应
      if (response.data && response.data.code === 0) {
        return {
          phone: response.data.data.phone,
        };
      } else {
        throw new Error(
          `获取手机号失败: ${response.data.message || "未知错误"}`
        );
      }
    } catch (error) {
      console.error("获取手机号异常:", error);

      // 开发环境下提供更多错误信息
      if (process.env.NODE_ENV === "development") {
        console.debug("认证结果:", authResult);
        console.debug("错误详情:", error.message, error.stack);
      }

      throw new Error(`获取手机号失败: ${error.message}`);
    }
  }

  /**
   * 在开发环境中模拟获取手机号
   * @param {string} deviceId - 设备ID
   * @returns {Promise<{phone: string}>} - 返回模拟的手机号码
   */
  static async mockPhoneNumber(deviceId) {
    // 仅在开发环境中使用
    if (process.env.NODE_ENV !== "development") {
      throw new Error("此方法仅允许在开发环境中使用");
    }

    // 根据deviceId生成一个固定的手机号，便于测试
    const phone = deviceId
      ? `138${deviceId.substring(0, 8).padEnd(8, "0")}`
      : "13800138000";

    console.log("[开发环境] 模拟手机号:", phone);

    return { phone };
  }
}

module.exports = UniverifyService;
