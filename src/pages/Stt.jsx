import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import QuizSection from "../components/QuizSection";

export default function Stt() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [audioId, setAudioId] = useState(null);
  const [activeTab, setActiveTab] = useState("transcript"); // "transcript", "summary", "quiz"
  const [result, setResult] = useState({
    transcript: null,
    summary: null,
    quiz: null,
  });
  const [loading, setLoading] = useState(false);

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

  const handleApiCall = async (type) => {
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

      {/** 탭 영역 (audioId가 있을 때만 표시) */}
      {audioId && (
        <div className="mt-10 w-full max-w-2xl bg-white shadow-md rounded-xl p-4">
          {/** 탭 헤더 */}
          <div className="flex border-b mb-4">
            {["transcript", "summary", "quiz"].map((tab) => (
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
            {activeTab === "transcript" && (
              <div>
                <button
                  onClick={() => handleApiCall("transcript")}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? "Trnascribing..." : "Transcription"}
                </button>
                {result.transcript && (
                  <pre className="mt-4 bg-gray-100 p-3 rounded whitespace-pre-line">
                    {result.transcript}
                  </pre>
                )}
              </div>
            )}

            {activeTab === "summary" && (
              <div>
                <button
                  onClick={() => handleApiCall("summary")}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-bray-400"
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
                  onClick={() => handleApiCall("quiz")}
                  disabled={loading}
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
          </div>
        </div>
      )}
    </div>
  );
}
