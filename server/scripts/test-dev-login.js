const axios = require("axios");

async function testDevLogin() {
  try {
    console.log("Testing dev-login endpoint...");

    // Set NODE_ENV to development
    process.env.NODE_ENV = "development";
    console.log("NODE_ENV set to:", process.env.NODE_ENV);

    const response = await axios.post(
      "http://localhost:3000/api/user/dev-login",
      {
        deviceId: "test-device-123",
      }
    );

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error("Error occurred:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }

    return null;
  }
}

// Execute the test
testDevLogin().then((result) => {
  if (result) {
    console.log("Test completed successfully");
  } else {
    console.log("Test failed");
  }
});
