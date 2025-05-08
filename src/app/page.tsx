// noinspection ExceptionCaughtLocallyJS

'use client';

import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  Grid,
} from '@mui/material';
import {
  UploadFile,
  Code,
  ExpandMore,
  Download,
  FilePresent
} from '@mui/icons-material';

export default function Home() {
  const [yamlInput, setYamlInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'grey.700', fontWeight: 'bold', textAlign: 'center' }}>
            Schema Merger | Schema Splitter
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Input Schema
            </Typography>

            {/* File Upload Section */}
            <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  backgroundColor: 'background.default'
                }}
            >
              <input
                  type="file"
                  ref={fileInputRef}
                  accept=".yaml,.yml"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
              />
              <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadFile />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 1}}
              >
                Upload YAML File
              </Button>

              {uploadedFileName ? (
                  <Chip
                      icon={<FilePresent />}
                      label={uploadedFileName}
                      color="success"
                      variant="outlined"
                  />
              ) : (
                  <Typography variant="body2" color="text.secondary">
                    No file selected (.yaml or .yml)
                  </Typography>
              )}
            </Paper>

            {/* Text Input Area */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Or paste YAML content directly:
            </Typography>
            <TextField
                multiline
                fullWidth
                rows={6}
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Paste your schema here..."
                variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="contained"
                color="primary"
                disabled={loading || !yamlInput.trim()}
                onClick={handleProcess}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Code />}
            >
              {loading ? 'Processing...' : 'Process Schema'}
            </Button>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Results Section */}
        {(selectedFileContent || fileList.length > 0) && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {fileList.length > 0 && (
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">
                          Generated Files ({fileList.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List
                            sx={{
                              maxHeight: 400,
                              overflow: 'auto',
                              bgcolor: 'background.paper',
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1
                            }}
                        >
                          {fileList.map((file, index) => (
                              <React.Fragment key={file}>
                                {index > 0 && <Divider />}
                                <ListItem disablePadding>
                                  <ListItemButton
                                      selected={selectedFile === file}
                                      onClick={() => fetchFile(file)}
                                      sx={{
                                        py: 1.5,
                                        '&.Mui-selected': {
                                          bgcolor: 'grey.400',
                                          '&:hover': {
                                            bgcolor: 'grey.500',
                                          },
                                        },
                                      }}
                                  >
                                    <ListItemText
                                        primary={file}
                                        primaryTypographyProps={{
                                          sx: {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontWeight: selectedFile === file ? 'medium' : 'normal'
                                          }
                                        }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              </React.Fragment>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                {selectedFileContent && (
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" component="div">
                            File: {selectedFile}
                          </Typography>
                          <Button
                              variant="outlined"
                              startIcon={<Download />}
                              onClick={downloadFile}
                              size="small"
                          >
                            Download
                          </Button>
                        </Box>
                        <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              maxHeight: 400,
                              overflow: 'auto',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                              fontFamily: 'monospace'
                            }}
                        >
                          <pre style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'normal'
                          }}>
                            {selectedFileContent}
                          </pre>
                        </Paper>
                      </CardContent>
                      <CardActions>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Download />}
                            onClick={downloadFile}
                            fullWidth
                        >
                          Download {selectedFile}
                        </Button>
                      </CardActions>
                    </Card>
                )}
              </Grid>
            </Grid>
        )}
      </Container>
  );
}