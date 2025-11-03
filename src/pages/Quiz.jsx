import { useState } from "react";
import api from "../api/client";

export default function Quiz() {
  const [form, setForm] = useState({
    keyword: "",
    level: "NORMAL",
    amount: 10,
  });

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedAnswers, setSelectedAnswers] = useState({}); // {questionIndex: answerIndex}
  const [score, setScore] = useState(null); // 채점 결과 저장

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setScore(null);

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
      setSelectedAnswers({});
    } catch (err) {
      setMessage("퀴즈 생성 실패: " + (err.response?.data?.detail || "오류"));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (qIdx, aIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleGradeQuiz = () => {
    if (!quizData) return;

    let correctCount = 0;

    quizData.forEach((q, qIdx) => {
      const selectedIdx = selectedAnswers[qIdx];
      if (selectedIdx === undefined) return;
      if (q.answers[selectedIdx].correct) correctCount += 1;
    });

    setScore(correctCount);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
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
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">퀴즈</h2>
          {quizData.map((q, qIdx) => (
            <div key={qIdx} className="mb-6 border p-4 rounded">
              <p className="font-medium mb-2">
                {qIdx + 1}. {q.question}
              </p>
              <ul className="space-y-1">
                {q.answers.map((a, aIdx) => {
                  const isSelected = selectedAnswers[qIdx] === aIdx;
                  const isCorrect = a.correct;
                  const showResult = score !== null; // 채점 완료 후에만 색 표시

                  return (
                    <label
                      key={aIdx}
                      className={`block cursor-pointer p-2 rounded border flex items-center gap-2 
                        ${isSelected ? "bg-blue-100" : ""}
                        ${
                          showResult && isSelected && isCorrect
                            ? "border-green-500 bg-green-50"
                            : ""
                        }
                        ${
                          showResult && isSelected && !isCorrect
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIdx}`}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(qIdx, aIdx)}
                        disabled={score !== null} // 채점 완료 시 선택 불가
                      />

                      {a.answer}
                    </label>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3">
            {score === null ? (
              <>
                <button
                  onClick={handleGradeQuiz}
                  className="w-full bg-green-500 text-white rounded py-2 hover:bg-green-600 disabled:bg-gray-400"
                  disabled={
                    Object.keys(selectedAnswers).length !== quizData.length
                  }
                >
                  채점하기
                </button>
              </>
            ) : (
              <>
                <p className="text-center font-semibold text-lg">
                  점수: {score} / {quizData.length}
                </p>
                <button
                  onClick={() => {
                    setQuizData(null);
                    setForm({ ...form, keyword: "" });
                  }}
                  className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600"
                >
                  새 퀴즈 시작하기
                </button>
                <button
                  onClick={handleRetryQuiz}
                  className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600"
                >
                  다시 도전하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
