"use client";
import { useState, useRef, useEffect } from "react";

const bullyOptions = [
  "Physical",
  "Verbal",
  "Cyberbullying",
  "Social Exclusion",
  "Other",
];

export default function HomePage() {
  const [tab, setTab] = useState<"video" | "picture" | "audio">("video");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const videoElem = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [details, setDetails] = useState("");
  const [bullyType, setBullyType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");

  const canSubmit =
    mediaFile &&
    details &&
    bullyType &&
    dateTime &&
    location &&
    (anonymous || name.trim().length > 2);

  const setupCamera = async () => {
    if (tab !== "audio") {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoElem.current) {
        videoElem.current.srcObject = stream;
        videoElem.current.play();
      }
    }
  };

  useEffect(() => {
    setupCamera();
    return () => {
      const stream = videoElem.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [tab]);

  useEffect(() => {
    // Auto-turn on camera on load if tab is not audio
    setupCamera();
  }, []);

  const handleTabChange = async (t: "video" | "picture" | "audio") => {
    setTab(t);
    deleteMedia();
  };

  const startRecording = async () => {
    if (tab === "picture") {
      const video = videoElem.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "evidence.png", {
              type: "image/png",
            });
            setMediaFile(file);
            setMediaUrl(URL.createObjectURL(blob));
          }
        }, "image/png");
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
      return;
    }

    const constraints =
      tab === "audio"
        ? { audio: true }
        : { video: true, audio: tab === "video" };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    const recorder = new MediaRecorder(stream);
    chunks.current = [];
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, {
        type: tab === "audio" ? "audio/webm" : "video/webm",
      });
      setMediaFile(new File([blob], `evidence.webm`));
      setMediaUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    mediaRef.current = recorder;
    setIsRecording(true);

    if (videoElem.current && tab !== "audio") {
      videoElem.current.srcObject = stream;
      videoElem.current.play();
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setIsRecording(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const deleteMedia = () => {
    setMediaFile(null);
    setMediaUrl(null);
  };

const handleSubmit = async () => {
  if (!canSubmit || !mediaFile) return;

  const formData = new FormData();
  formData.append('media', mediaFile);
  formData.append('type', tab);
  formData.append('details', details);
  formData.append('bullyType', bullyType);
  formData.append('dateTime', dateTime);
  formData.append('location', location);
  formData.append('anonymous', anonymous.toString());
  formData.append('name', name);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    window.location.href = '/success';
  } else {
    alert('Failed to submit report.');
  }
};


  return (
    <main className="relative bg-white max-w-sm mx-auto h-screen p-4 font-sans">
      <h1 className="text-center font-bold text-xl mb-4">Reporting</h1>
      <p className="text-center text-sm font-semibold mb-2">
        Provide the Evidence of the Incident
      </p>

      {/* Tabs */}
      <div className="flex justify-between mb-4">
        {["video", "picture", "audio"].map((t) => (
          <button
            key={t}
            className={`w-1/3 h-10 m-1 rounded-full flex flex-col items-center justify-center
             ${
               tab === t ? "bg-blue-600 text-white" : "bg-blue-200 text-black"
             }`}
            onClick={() => handleTabChange(t as any)}
          >
            <img src={`/icons/${t}.png`} alt={t} className="w-6 h-6 mb-1" />
            <span className="text-xs uppercase">{t}</span>
          </button>
        ))}
      </div>

      {/* Media Area */}
      <div className="bg-gray-50 border border-black rounded-lg p-4 mb-4 min-h-[160px]">
        {!mediaUrl ? (
          <div>
            {tab !== "audio" && (
              <video ref={videoElem} className="w-full mb-2 rounded" />
            )}
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center gap-3">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <img src="/icons/record.png" className="w-4 h-4" /> Stop
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <img src="/icons/record.png" className="w-4 h-4" />
                  {tab === "picture" ? "Take Picture" : "Record"}
                </button>
              )}
              <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer flex items-center gap-1">
                <img src="/icons/upload.png" className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept={tab + "/*"}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div>
            {tab === "audio" && (
              <audio controls src={mediaUrl} className="w-full" />
            )}
            {tab === "video" && (
              <video controls src={mediaUrl} className="w-full mb-2" />
            )}
            {tab === "picture" && (
              <img src={mediaUrl} alt="pic" className="w-full mb-2 rounded" />
            )}
            <div className="flex justify-center gap-2">
              <button
                onClick={deleteMedia}
                className="bg-gray-500 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <img src="/icons/delete.png" className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="font-semibold text-sm mb-1">
        Share details of the Incident
      </p>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Type..."
        className="w-full h-36 border border-black rounded-lg p-3 mb-4 resize-none text-sm"
      />

      <div className="flex justify-between mb-4 text-xs">
        <select
          className="border border-blue-500 bg-blue-100 rounded px-2 py-2 w-1/3 text-black mr-1"
          value={bullyType}
          onChange={(e) => setBullyType(e.target.value)}
        >
          <option value="">Bully Type</option>
          {bullyOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          className="border border-blue-500 bg-blue-100 rounded px-2 py-2 w-1/3 text-black mr-1"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          className="border border-blue-500 bg-blue-100 rounded px-2 py-2 w-1/3 text-black"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={() => setAnonymous(!anonymous)}
          className="w-5 h-5 rounded accent-blue-600 bg-white border border-blue-500 mr-2"
        />
        <span className="text-xs font-semibold">Submit Anonymously</span>
      </div>
      {!anonymous && (
        <input
          type="text"
          placeholder="Your name"
          className="border border-black rounded px-2 py-1 w-full mb-4 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <button
        disabled={!canSubmit}
        onClick={handleSubmit}
        className={`w-full py-3 mb-4 ${
          canSubmit ? "bg-blue-600 text-white" : "bg-gray-400 text-gray-200"
        } rounded-full`}
      >
        Submit Report
      </button>

      <p className="text-center text-xs text-blue-600 underline">
        Need Help? Contact Us
      </p>
    </main>
  );
}
