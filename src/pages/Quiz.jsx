import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import QuizSection from "../components/QuizSection";

export default function Quiz() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    keyword: "",
    level: "NORMAL",
    amount: 10,
  });

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/api/quiz/quiz-data", form);

      // Mock data for testing without backend
      // const res = {
      //   data: {
      //     quiz_data: [
      //       {
      //         question: `${form.keyword} 관련 샘플 질문 1?`,
      //         answers: [
      //           { answer: "Answer A", correct: true },
      //           { answer: "Answer B", correct: false },
      //           { answer: "Answer C", correct: false },
      //           { answer: "Answer D", correct: false },
      //         ],
      //       },
      //       {
      //         question: `${form.keyword} 관련 샘플 질문 2?`,
      //         answers: [
      //           { answer: "Answer A", correct: false },
      //           { answer: "Answer B", correct: true },
      //           { answer: "Answer C", correct: false },
      //           { answer: "Answer D", correct: false },
      //         ],
      //       },
      //     ],
      //   },
      // };

      const { quiz_data } = res.data;

      setQuizData(quiz_data);
    } catch (err) {
      setMessage("퀴즈 생성 실패: " + (err.response?.data?.detail || "오류"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        홈
      </button>
      {!quizData ? (
        <form onSubmit={fetchQuiz} className="space-y-4">
          <h2 className="text-xl font-semibold text-center">퀴즈 생성</h2>

          <div>
            <label className="block mb-1">Keyword:</label>
            <input
              type="text"
              name="keyword"
              value={form.keyword}
              onChange={handleChange}
              placeholder="키워드를 입력하세요"
              className="border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Level:</label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">난이도 선택</option>
              <option value="EASY">쉬움</option>
              <option value="NORMAL">보통</option>
              <option value="HARD">어려움</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Amount:</label>
            <select
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">문제 수 선택</option>
              <option value={5}>5문제</option>
              <option value={10}>10문제</option>
              <option value={20}>20문제</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "퀴즈 시작"}
          </button>
          {message && <p className="text-center text-sm mt-2">{message}</p>}
        </form>
      ) : (
        <QuizSection fetchQuizData={quizData} onQuizDataChange={setQuizData} />
      )}
    </div>
  );
}
