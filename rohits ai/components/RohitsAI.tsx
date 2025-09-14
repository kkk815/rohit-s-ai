"use client";
import React, { useState } from "react";

type Platform = "Twitter (X)" | "Instagram" | "LinkedIn" | "Facebook" | "Threads";

export default function RohitsAI(): JSX.Element {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [platform, setPlatform] = useState<Platform>("Twitter (X)");
  const [post, setPost] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function generatePostWithAI(promptText: string, tone: string, platform: Platform) {
    if (!promptText.trim()) return "";
    setLoading(true);
    try {
      const res = await fetch("/api/rohits-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", prompt: promptText, tone, platform }),
      });
      const data = await res.json();
      return data.post || "";
    } finally {
      setLoading(false);
    }
  }

  async function reviewPostWithAI(postText: string) {
    if (!postText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rohits-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review", post: postText }),
      });
      const data = await res.json();
      setIssues(data.problems || []);
      setSuggestions(data.suggestions || []);
      setHashtags(data.hashtags || []);
    } finally {
      setLoading(false);
    }
  }

  async function onGenerate() {
    const g = await generatePostWithAI(prompt, tone, platform);
    setPost(g);
    await reviewPostWithAI(g);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">✨ Rohit’s AI ✨</h1>
      <p className="text-gray-600 mb-6">Your personal post writer & reviewer.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Prompt / Topic</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your idea..."
            className="w-full p-3 border rounded-lg h-28 resize-vertical"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Tone</label>
            <select className="w-full p-2 border rounded" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Friendly</option>
              <option>Professional</option>
              <option>Casual</option>
              <option>Energetic</option>
              <option>Inspiring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Platform</label>
            <select className="w-full p-2 border rounded" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
              <option>Twitter (X)</option>
              <option>Instagram</option>
              <option>LinkedIn</option>
              <option>Facebook</option>
              <option>Threads</option>
            </select>
          </div>

          <button
            onClick={onGenerate}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded shadow w-full"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Generated Post</label>
        <textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="w-full p-3 border rounded h-40 resize-vertical"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => reviewPostWithAI(post)} disabled={loading} className="px-3 py-2 border rounded">
          {loading ? "Reviewing..." : "Review"}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(post)}
          className="px-3 py-2 border rounded"
        >
          Copy
        </button>
      </div>

      {issues.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <h3 className="font-semibold">Problems</h3>
          <ul className="list-disc list-inside">
            {issues.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="font-semibold">Suggestions</h3>
          <ul className="list-disc list-inside">
            {suggestions.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      )}

      <div className="mb-6 p-3 bg-white border rounded">
        <h3 className="font-semibold mb-2">Hashtag suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {hashtags.length === 0 && <span className="text-sm text-gray-500">No suggestions yet.</span>}
          {hashtags.map((h, i) => <span key={i} className="px-2 py-1 border rounded">{h}</span>)}
        </div>
      </div>
    </div>
  );
}