"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getDocument, updateDocument, type Document } from "@/lib/firestore";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { debounce } from "lodash";

const DocumentIdPage = () => {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  useEffect(() => {
    if (params.documentId) {
      fetchDocument();
    }
  }, [params.documentId]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const doc = await getDocument(params.documentId as string);
      setDocument(doc);
    } catch (error: any) {
      toast.error(error.message || "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce content updates to avoid too many writes
  const debouncedUpdate = useCallback(
    debounce(async (documentId: string, content: string) => {
      try {
        await updateDocument(documentId, { content });
      } catch (error: any) {
        console.error("Error updating document:", error);
      }
    }, 1000),
    []
  );

  const handleContentChange = (content: string) => {
    if (!document) return;
    debouncedUpdate(document.id, content);
  };

  const handleTitleChange = useCallback(
    debounce(async (documentId: string, title: string) => {
      try {
        await updateDocument(documentId, { title });
      } catch (error: any) {
        console.error("Error updating title:", error);
      }
    }, 500),
    []
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="h-[35vh]" />
      <div className="max-w-3xl lg:max-w-4xl mx-auto">
        <div className="pl-8 pt-4">
          <input
            type="text"
            className="text-5xl font-bold break-words bg-transparent border-none outline-none w-full resize-none"
            value={document.title}
            onChange={(e) => {
              setDocument({ ...document, title: e.target.value });
              handleTitleChange(document.id, e.target.value);
            }}
            placeholder="Untitled"
          />
        </div>
        <div className="pl-8 pt-8">
          <Editor
            onChange={handleContentChange}
            initialContent={document.content}
            editable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentIdPage;