import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, Button, Space } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  FontSizeOutlined
} from '@ant-design/icons';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  disabled = false
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled
  });

  if (!editor) return null;

  return (
    <Card>
      <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
        <Space>
          <Button type={editor.isActive('bold') ? 'primary' : 'default'} icon={<BoldOutlined />} onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled} />
          <Button type={editor.isActive('italic') ? 'primary' : 'default'} icon={<ItalicOutlined />} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled} />
          <Button type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} icon={<FontSizeOutlined />} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={disabled} />
          <Button type={editor.isActive('bulletList') ? 'primary' : 'default'} icon={<UnorderedListOutlined />} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled} />
          <Button type={editor.isActive('orderedList') ? 'primary' : 'default'} icon={<OrderedListOutlined />} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled} />
          <Button onClick={() => editor.chain().focus().clearNodes().run()} disabled={disabled}>清除格式</Button>
        </Space>
      </div>
      
      <div style={{ minHeight: 300, border: '1px solid #f0f0f0', borderRadius: 4, padding: 16 }}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </Card>
  );
}
