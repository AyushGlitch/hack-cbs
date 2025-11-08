"use client"

import React, { useState } from 'react';

export default function MedicalReportSummarizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    const res = await fetch('/api/summarize-report', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setSummary(data.summary || 'No summary available.');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <h1>Medical Report Summarizer</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading} style={{ marginLeft: 8 }}>
        {loading ? 'Summarizing...' : 'Upload & Summarize'}
      </button>
      {summary && (
        <div style={{ marginTop: 32 }}>
          <h2>Summary</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{summary}</pre>
        </div>
      )}
    </div>
  );
}
