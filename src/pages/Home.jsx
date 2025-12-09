import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // TODO: 사용자 데이터 가져오는 api 작성 예정
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      setUserData({});
    }
    // api
    //   .get("/users/me")
    //   .then((res) => {
    //     setUserData(res.data);
    //   })
    //   .catch(() => {
    //     navigate("/login");
    //   });
  }, []); // 해당 인자는 의존성 배열. 배열 안 값이 바뀔 때만 effect가 실행된다. 빈 배열을 넣을 경우, 컴포넌트가 처음 마운트 될 때만 실행된다.

  const handleLogout = () => {
    // TODO: 로그아웃 api 작성 예정(refresh_token 무효화)
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {userData ? (
        <>
          <p className="mb-4">안녕하세요!</p>

          {/* 기능 버튼 영역 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/quiz")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              퀴즈 시작
            </button>
            <button
              onClick={() => navigate("/stt")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              음성 변환
            </button>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb0-4">홈 페이지</h1>

          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그인
          </button>
        </>
      )}
    </div>
  );
}
