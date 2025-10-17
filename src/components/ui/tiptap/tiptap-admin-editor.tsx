'use client';

import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';

// Criar instância do lowlight e registrar linguagens
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('json', json);
lowlight.register('python', python);
lowlight.register('sql', sql);
import TiptapBaseEditor, { TiptapBaseEditorRef } from './tiptap-base-editor';
import LinkInsertModal from './link-insert-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Video,
  Link,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Table as TableIcon,
  Images
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import CarouselPresentation from '../carousel-presentation';

interface TiptapAdminEditorProps {
  content: string;
  onChange: (content: string) => void;
  courseId: string;
  placeholder?: string;
  className?: string;
}

export interface TiptapAdminEditorRef {
  insertImage: (url: string, alt?: string) => void;
  insertYouTube: (url: string) => void;
  focus: () => void;
  getHTML: () => string;
  setContent: (content: string) => void;
}

/**
 * Editor Tiptap para administradores
 * Inclui todas as funcionalidades avançadas de edição
 */
const TiptapAdminEditor = forwardRef<TiptapAdminEditorRef, TiptapAdminEditorProps>((
  {
    content,
    onChange,
    courseId,
    placeholder = 'Digite o conteúdo do módulo...',
    className = ''
  },
  ref
) => {
  const editorRef = useRef<TiptapBaseEditorRef>(null);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  
  // Extensões avançadas para administradores
  const adminExtensions = [
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'tiptap-table-row',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'tiptap-table-header',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'tiptap-table-cell',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'tiptap-highlight',
      },
    }),
    Color,
    TextStyle,
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'tiptap-code-block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
      },
    }),
  ];

  // Expor métodos através da ref
  useImperativeHandle(ref, () => ({
    insertImage: (url: string, alt?: string) => {
      editorRef.current?.insertImage(url, alt);
    },
    insertYouTube: (url: string) => {
      editorRef.current?.insertYouTube(url);
    },
    focus: () => {
      editorRef.current?.focus();
    },
    getHTML: () => {
      return editorRef.current?.getHTML() || '';
    },
    setContent: (content: string) => {
      editorRef.current?.setContent(content);
    },
  }), []);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true; // Allow multiple file selection
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0 && editorRef.current?.editor) {
        // Show loading state
        toast({
          title: "Uploading images...",
          description: `Uploading ${files.length} image(s)`,
        });

        // Handle multiple files sequentially to avoid overwhelming the server
        for (const file of files) {
          try {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
              toast({
                title: "File too large",
                description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
                variant: "destructive",
              });
              continue;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
              toast({
                title: "Invalid file type",
                description: `${file.name} is not a valid image file.`,
                variant: "destructive",
              });
              continue;
            }

            // Trigger the drag and drop handler
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const event = new DragEvent('drop', { dataTransfer });
            editorRef.current!.editor!.view.dom.dispatchEvent(event);
          } catch (error) {
            console.error('Error uploading file:', error);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            });
          }
        }
      }
    };
    input.click();
  };

  const handleModalInsertLink = (url: string, text?: string) => {
    if (editorRef.current?.editor) {
      if (text) {
        editorRef.current.editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
      } else {
        editorRef.current.editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const handleModalInsertVideo = (url: string) => {
    if (editorRef.current) {
      // Verificar se é URL do YouTube
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
      if (ytMatch) {
        // Use the original URL, the extension will handle the conversion
        editorRef.current.insertYouTube(url);
      } else {
        // Verificar se é URL do Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          // For Vimeo, create a simple iframe since our YouTube extension doesn't handle it
          const iframeHtml = `<div class="video-wrapper aspect-video max-w-full mx-auto my-4">
            <iframe src="${embedUrl}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg"></iframe>
          </div>`;
          editorRef.current.editor?.chain().focus().insertContent(iframeHtml).run();
        } else {
          toast({
            title: "Erro",
            description: "URL de vídeo inválida. Use URLs do YouTube ou Vimeo.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleModalInsertImage = (url: string, alt?: string) => {
    if (editorRef.current) {
      editorRef.current.insertImage(url, alt);
    }
  };

  const handleOpenModal = (tab?: string) => {
    if (tab) {
      setActiveTab(tab);
    }
    setIsModalOpen(true);
  };

  const handleInsertCarousel = (carouselId: string) => {
    if (editorRef.current) {
      const carouselHtml = `<div class="carousel-container" data-carousel-id="${carouselId}"><p>Carrossel de Imagens</p></div>`;
      editorRef.current.editor?.chain().focus().insertContent(carouselHtml).run();
      setIsCarouselModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Carrossel inserido com sucesso!",
      });
    }
  };

  const [activeTab, setActiveTab] = useState('link');

  const ToolbarButton = ({ onClick, active = false, children, title }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  const editor = editorRef.current?.editor;

  return (
    <div className="tiptap-admin-editor space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50">
        {/* Formatação de texto */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive('underline')}
            title="Sublinhado"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive('strike')}
            title="Riscado"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Cabeçalhos */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive('heading', { level: 1 })}
            title="Cabeçalho 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 })}
            title="Cabeçalho 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor?.isActive('heading', { level: 3 })}
            title="Cabeçalho 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alinhamento */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            active={editor?.isActive({ textAlign: 'left' })}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            active={editor?.isActive({ textAlign: 'center' })}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            active={editor?.isActive({ textAlign: 'right' })}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            active={editor?.isActive({ textAlign: 'justify' })}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Elementos especiais */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive('blockquote')}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive('codeBlock')}
            title="Bloco de código"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Inserir tabela"
          >
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Mídia */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => handleOpenModal('image')}
            title="Inserir imagem"
          >
            <Image className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => handleOpenModal('video')}
            title="Inserir vídeo"
          >
            <Video className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setIsCarouselModalOpen(true)}
            title="Inserir carrossel de imagens"
          >
            <Images className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => handleOpenModal('link')}
            title="Inserir link"
          >
            <Link className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <TiptapBaseEditor
        ref={editorRef}
        content={content}
        onChange={onChange}
        extensions={adminExtensions}
        courseId={courseId}
        placeholder={placeholder}
        className={`min-h-[400px] ${className}`}
      />
      
      {/* Modal para inserção de links, vídeos e imagens */}
      <LinkInsertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsertLink={handleModalInsertLink}
        onInsertVideo={handleModalInsertVideo}
        onInsertImage={handleModalInsertImage}
        defaultTab={activeTab}
      />
      
      {/* Modal para inserção de carrossel */}
      {isCarouselModalOpen && (
        <CarouselPresentation
          onSave={(data) => {
            handleInsertCarousel(data);
            setIsCarouselModalOpen(false);
          }}
          onCancel={() => setIsCarouselModalOpen(false)}
        />
      )}
    </div>
  );
});

TiptapAdminEditor.displayName = 'TiptapAdminEditor';

export default TiptapAdminEditor;
