import { useState } from "react";

import api from "../api/client";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/users/register", form);
      setMessage("회원가입 성공! 로그인해주세요.");
    } catch (err) {
      setMessage("회원가입 실패: " + (err.response?.data?.detail || "오류"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
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
          className="bg-green-500 text-white w-full p-2 rounded hover:bg-green-600"
        >
          회원가입
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
