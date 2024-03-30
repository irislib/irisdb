import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCheckboxMultipleBlankLine,
  RiCodeBoxLine,
  RiCodeSSlashLine,
  RiDoubleQuotesL,
  RiFormatClear,
  RiH1,
  RiH2,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiSeparator,
  RiStrikethrough,
  RiTextWrap,
} from '@remixicon/react';
import { Editor } from '@tiptap/react';
import { Fragment } from 'react';

import MenuItem from './MenuItem';

export default ({ editor }: { editor: Editor }) => {
  const items = [
    {
      IconComponent: RiBold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      IconComponent: RiItalic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      IconComponent: RiStrikethrough,
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      IconComponent: RiCodeSSlashLine,
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      IconComponent: RiMarkPenLine,
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      type: 'divider',
    },
    {
      IconComponent: RiH1,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      IconComponent: RiH2,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      IconComponent: RiListUnordered,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      IconComponent: RiListOrdered,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      IconComponent: RiCheckboxMultipleBlankLine,
      title: 'Task List',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    {
      IconComponent: RiCodeBoxLine,
      title: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      type: 'divider',
    },
    {
      IconComponent: RiDoubleQuotesL,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      IconComponent: RiSeparator,
      title: 'Horizontal Rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      type: 'divider',
    },
    {
      IconComponent: RiTextWrap,
      title: 'Hard Break',
      action: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      IconComponent: RiFormatClear,
      title: 'Clear Format',
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      type: 'divider',
    },
    {
      IconComponent: RiArrowGoBackLine,
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      IconComponent: RiArrowGoForwardLine,
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="hidden md:flex justify-center w-full gap-2 p-2 bg-base-200 border-b border-base-300">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === 'divider' ? (
            <div className="divider h-full w-px bg-gray-300 mx-2" />
          ) : (
            <MenuItem {...item} />
          )}
        </Fragment>
      ))}
    </div>
  );
};
