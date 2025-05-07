'use client';

import { useState } from 'react';

export default function Home() {
  const [yamlInput, setYamlInput] = useState('');
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    setSelectedFileContent('');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yamlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unexpected error');
      setFileList(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFile = async (filename: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schema/${filename}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug response

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

  return (
      <main className="p-6 max-w-3xl mx-auto bg-white rounded-md shadow">
        <h1 className="text-2xl font-bold mb-4">Schema Merger</h1>

        <div className="mb-4">
          <label htmlFor="yaml" className="block font-medium mb-1">Input Schema (YAML)</label>
          <textarea
              id="yaml"
              rows={6}
              className="w-full border p-2 rounded"
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              placeholder="Paste your schema here..."
          />
        </div>

        <button
            onClick={handleProcess}
            disabled={loading}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          {loading ? 'Processing...' : 'Process'}
        </button>

        {error && <p className="text-red-600 mt-4">Error: {error}</p>}

        {fileList.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Generated Files:</h2>
              <ul className="list-disc list-inside">
                {fileList.map((file) => (
                    <li key={file}>
                      <button className="text-blue-600 hover:underline" onClick={() => fetchFile(file)}>
                        {file}
                      </button>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {selectedFileContent && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">File Content:</h2>
              <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded max-h-96 overflow-auto">
                {selectedFileContent}
              </pre>
            </div>
        )}
      </main>
  );
}
