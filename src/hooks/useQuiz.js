import { useState } from "react";

export default function useQuiz(initialData = null) {
  const [quizData, setQuizData] = useState(initialData);

  const [selectedAnswers, setSelectedAnswers] = useState({}); // {questionIndex: answerIndex}
  const [score, setScore] = useState(null); // 채점 결과 저장

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

  return {
    quizData,
    selectedAnswers,
    score,
    handleAnswerSelect,
    handleGradeQuiz,
    handleRetryQuiz,
  };
}
