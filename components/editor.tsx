"use client";

import React from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();

  const handleUpload = async (file: File) => {
    try {
      const timestamp = Date.now();
      const storageRef = ref(
        storage,
        `editor-uploads/${timestamp}-${file.name}`
      );

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  React.useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      onChange(JSON.stringify(editor.document, null, 2));
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [editor, onChange]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="editor-wrapper">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
      />
    </div>
  );
};

export default Editor;