'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Props { content: string; onChange: (value: string) => void; placeholder?: string; }
export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder }), Link.configure({ openOnClick: false })],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'prose prose-indigo max-w-none focus:outline-none min-h-64' } },
  });
  if (!editor) return null;
  const Btn = ({ onClick, active, children, title }: any) => (
    <button type="button" onClick={onClick} title={title} className={cn('p-1.5 rounded-lg transition-colors', active?'bg-indigo-100 text-indigo-700':'text-gray-500 hover:bg-gray-100')}>{children}</button>
  );
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})} title="H2"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="List"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered"><ListOrdered className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></Btn>
      </div>
      <div className="p-4"><EditorContent editor={editor} /></div>
    </div>
  );
}
