import { useState } from "react";
import api from "../api/client";

export default function Stt() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요.");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setUploading(true);
      setResponse(null);

      const res = await api.post("/api/speech-to-text/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.ok) throw new Error("업로드 실패");

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">오디오 파일 업로드</h1>

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

      {response && (
        <div className="mt-6 p-4 border rounded bg-white shadow"></div>
      )}
    </div>
  );
}
