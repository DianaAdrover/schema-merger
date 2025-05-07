'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [yamlInput, setYamlInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'yaml' && fileExt !== 'yml') {
      setError('Please upload a valid YAML file (.yaml or .yml)');
      return;
    }

    setUploadedFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setYamlInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    setSelectedFileContent('');
    setSelectedFile('');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yamlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unexpected error');

      // Sort files alphabetically
      const sortedFiles = [...data.files].sort((a, b) => a.localeCompare(b));
      setFileList(sortedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFile = async (filename: string) => {
    try {
      setLoading(true);
      setSelectedFile(filename);
      const res = await fetch(`/api/schema/${filename}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();

      if (data.content) {
        setSelectedFileContent(data.content);
      } else {
        setError('No content found in response');
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!selectedFileContent || !selectedFile) return;

    const blob = new Blob([selectedFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
      <main>
        <h1>Schema Merger</h1>
        <div>
          <label>Input Schema (YAML)</label>
          <div>
            <input
                type="file"
                ref={fileInputRef}
                accept=".yaml,.yml"
                onChange={handleFileUpload}
            />
            <div>
              {uploadedFileName ? (
                  <span>Selected: {uploadedFileName}</span>
              ) : (
                  <span>No file selected (.yaml or .yml)</span>
              )}
            </div>
          </div>
          {/* Keep textarea as fallback */}
          <div
          >
            <div>
              <span>Or paste YAML content directly:</span>
            </div>
            <textarea
                rows={6}
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Paste your schema here..."
            />
          </div>
        </div>
        <button
            onClick={handleProcess}
            disabled={loading || !yamlInput.trim()}
        >
          {loading ? 'Processing...' : 'Process'}
        </button>
        {error && <p>Error: {error}</p>}
        <div>
          {selectedFileContent && (
            <div>
              <div >
                <h2>File Content: {selectedFile}</h2>
                <button
                    onClick={downloadFile}
                >
                  Download {selectedFile}
                </button>
              </div>
              <pre>
                  {selectedFileContent}
                </pre>
            </div>
        )}
          {fileList.length > 0 && (
              <div>
                <h2>Generated Files:</h2>
                <div>
                  {fileList.map((file) => (
                      <button
                          key={file}
                          onClick={() => fetchFile(file)}
                      >
                        {file}
                      </button>
                  ))}
                </div>
              </div>
          )}
        </div>
      </main>
  );
}