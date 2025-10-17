import React, { useState } from 'react';
import TiptapAdminEditor, { TiptapAdminEditorRef } from './tiptap-admin-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Test component for YouTube embedding functionality
 * This component can be used to test the YouTube video embedding features
 */
const TestYouTubeEmbedding: React.FC = () => {
  const [content, setContent] = useState('');
  const [testUrl, setTestUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const editorRef = React.useRef<TiptapAdminEditorRef>(null);

  const handleInsertTestVideo = () => {
    if (editorRef.current) {
      editorRef.current.insertYouTube(testUrl);
    }
  };

  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://vimeo.com/148751763',
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Embedding Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter YouTube or Vimeo URL"
              className="flex-1"
            />
            <Button onClick={handleInsertTestVideo}>
              Insert Video
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Test URLs:</p>
            <div className="flex flex-wrap gap-2">
              {testUrls.map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTestUrl(url)}
                >
                  Test {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapAdminEditor
            ref={editorRef}
            content={content}
            onChange={setContent}
            courseId="test-course"
            placeholder="Try pasting a YouTube URL or use the video button in the toolbar..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated HTML</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
            {content || 'No content yet...'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Try pasting a YouTube URL directly into the editor</p>
          <p>• Use the video button in the toolbar to insert videos via modal</p>
          <p>• Click on inserted videos to see controls (resize, delete, open in YouTube)</p>
          <p>• Test drag and drop image upload functionality</p>
          <p>• Verify responsive behavior on different screen sizes</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestYouTubeEmbedding;
