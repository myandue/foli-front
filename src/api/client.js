import axios from "axios";

const baseUrl = process.env.BACKEND_SERVER_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// api 요청 시 access_token 헤더에 포함
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// access_token 만료 시 refresh 토큰으로 갱신 후 재요청
let isRefreshing = false; // 토큰 갱신 중인지 여부
let refreshSubscribers = []; // 갱신 완료 후 재요청 대기 중인 요청들

// 토큰 갱신 후 대기 중인 요청 실행하기 위한 함수
const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // access_token 만료 시 401 응답이면 refresh 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      // _retry: 재요청 한 적 없는 요청일 경우에만
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        console.warn("No refresh token found, redirecting to login.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중이면 대기 목록에 추가 => 갱신 완료되면 재요청될 예정
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccessToken) => {
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseUrl}/api/token/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        api.defaults.headers["Authorization"] = `Bearer ${access_token}`;
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

        onRefreshed(access_token); // 대기 중인 요청들 실행
        return api(originalRequest); // 원래 요청 재시도
      } catch (refreshError) {
        console.error(
          "Token refresh failed, redirecting to login.",
          refreshError
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error); // 다른 오류는 그대로 반환
  }
);

export default api;
