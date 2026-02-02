import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import QuizSection from "../components/QuizSection";

export default function Stt() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [audioId, setAudioId] = useState(null);
  const [activeTab, setActiveTab] = useState("summary"); // "summary", "quiz", "qna"
  const [result, setResult] = useState({
    transcript: null,
    summary: null,
    quiz: null,
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "안녕하세요! 업로드한 오디오 파일에 대해 질문해보세요.",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");

  const transcriptReady = !!result.transcript;

  const setQuizData = (data) => {
    setResult((prev) => ({ ...prev, quiz: data }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요.");

    const formData = new FormData();
    formData.append("audio_file", file);

    try {
      setUploading(true);

      const res = await api.post("/api/speech-to-text/upload-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const audio_id = await res.data.id;
      setAudioId(audio_id);
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalysis = async (type) => {
    if (!audioId) return alert("먼저 오디오 파일을 업로드해주세요.");
    if (type !== "transcript" && result.transcript === null)
      return alert("먼저 Transcription을 수행해주세요.");

    setLoading(true);
    try {
      const res = await api.post(`/api/speech-to-text/${type}`, {
        id: audioId,
      });
      const data = await res.data[type];

      setResult((prev) => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`${type} 중 오류 발생:`, error);
      alert(`${type} 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!inputQuestion.trim() || !audioId) return;

    const userMessage = {
      role: "user",
      content: inputQuestion,
    };

    // 1. 사용자 메시지 먼저 채팅에 추가
    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion("");
    setLoading(true);

    try {
      // 2. API 호출
      const res = await api.post("/api/speech-to-text/qna", {
        id: audioId,
        content: userMessage.content,
      });

      // ⚠️ 서버 응답 형태에 맞게 조정
      const answer = res.data.answer;
      const assistantMessage = {
        role: "assistant",
        content: answer,
      };

      // 3. AI 답변 추가
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Q&A 오류:", error);

      // 4. 에러도 채팅 메시지로 처리 (UX 중요)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "답변을 생성하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // TODO: 각 result 존재할 시에 버튼 비활성화
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        홈
      </button>
      <h1 className="text-2xl font-bold mb-4">오디오 파일 업로드 & 분석</h1>

      {/** 파일 업로드 섹션 */}
      <div className="flex flex-col items-center bg-white shadow-md p-6 rounded-xl w-full max-w-md">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? "업로드 중..." : "업로드"}
        </button>
      </div>

      {/** Transcript 섹션 (audioId가 있을 때만 표시) */}
      {audioId && (
        <div className="mt-10 w-full max-w-2xl bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📄 Transcript</h2>

          <button
            onClick={() => handleAnalysis("transcript")}
            disabled={loading || result.transcript}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Transcribing..." : "Generate Transcript"}
          </button>

          {result.transcript ? (
            <pre className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-line max-h-64 overflow-y-auto">
              {result.transcript}
            </pre>
          ) : (
            <p className="mt-4 text-gray-400 text-sm">
              Transcript가 생성되면 아래 기능을 사용할 수 있어요.
            </p>
          )}
        </div>
      )}

      {/** 탭 영역 (audioId가 있을 때만 표시 & Transcript가 존재할 때만 버튼 활성화) */}
      {audioId && (
        <div className="mt-10 w-full max-w-2xl bg-white shadow-md rounded-xl p-4">
          {/** 탭 헤더 */}
          <div className="flex border-b mb-4">
            {["summary", "quiz", "qna"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 font-semibold capitalize border-b-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/** 탭 내용 */}
          <div className="p-4">
            {activeTab === "summary" && (
              <div>
                <button
                  onClick={() => handleAnalysis("summary")}
                  disabled={loading || !transcriptReady || result.summary}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? "Summarizing..." : "Summary"}
                </button>
                {result.summary && (
                  <pre className="mt-4 bg-gray-100 p-3 rounded whitespace-pre-line">
                    {result.summary}
                  </pre>
                )}
              </div>
            )}

            {activeTab === "quiz" && (
              <div>
                <button
                  onClick={() => handleAnalysis("quiz")}
                  disabled={loading || !transcriptReady || result.quiz}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? "Generating Quiz..." : "Generate Quiz"}
                </button>
                {result.quiz && (
                  <pre className="mt-4 bg-gray-100 p-3 rounded whitespace-pre-wrap">
                    <QuizSection
                      fetchQuizData={result.quiz}
                      onQuizDataChange={setQuizData}
                    />
                  </pre>
                )}
              </div>
            )}

            {activeTab === "qna" && (
              <div className="flex flex-col h-[420px]">
                {/* 채팅 영역 */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded">
                  {/* Transcript 없음 */}
                  {!result.transcript && (
                    <div className="text-sm text-gray-400 text-center mt-10">
                      🔒 Transcript를 먼저 생성해야 대화를 시작할 수 있어요.
                    </div>
                  )}

                  {/* Transcript 있음 */}
                  {result.transcript &&
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-xl text-sm whitespace-pre-line
                ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border"
                }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}

                  {/* 로딩 메시지 */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border px-4 py-2 rounded-xl text-sm text-gray-400">
                        🤖 입력 중…
                      </div>
                    </div>
                  )}
                </div>

                {/* 입력 영역 */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendQuestion();
                      }
                    }}
                    disabled={!result.transcript || loading}
                    placeholder="이 음성에 대해 질문해보세요"
                    className="flex-1 border rounded-full px-4 py-2 text-sm
                   disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendQuestion}
                    disabled={!inputQuestion || !result.transcript || loading}
                    className="
                      bg-blue-500 text-white px-4 py-2 rounded-full
                      hover:bg-blue-600
                      disabled:bg-gray-400
                      disabled:cursor-not-allowed
                    "
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
