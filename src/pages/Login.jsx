import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/token", form);
      const { access, refresh } = res.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      navigate("/");
    } catch (err) {
      setMessage("로그인 실패: " + (err.response?.data?.detail || "오류"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg w-80 space-y-4"
      >
        <input
          name="username"
          placeholder="아이디"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600"
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="bg-green-500 text-white w-full p-2 rounded hover:bg-green-600"
        >
          회원가입
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
        {/* 조건부 렌더링 문법. && <- condition(message) 값이 true일 때 뒤에 적인 Component를 렌더링 함. 빈 문자열 또한 false에 해당.*/}
      </form>
    </div>
  );
}
