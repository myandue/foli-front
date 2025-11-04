import useQuiz from "../hooks/useQuiz";

export default function QuizSection({ fetchQuizData, onQuizDataChange }) {
  const {
    quizData,
    selectedAnswers,
    score,
    handleAnswerSelect,
    handleGradeQuiz,
    handleRetryQuiz,
  } = useQuiz(fetchQuizData);

  return (
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
              disabled={Object.keys(selectedAnswers).length !== quizData.length}
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
                onQuizDataChange(null);
              }}
              className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600"
            >
              새 퀴즈 시작하기
            </button>
            <button
              onClick={() => {
                handleRetryQuiz();
              }}
              className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600"
            >
              다시 도전하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
