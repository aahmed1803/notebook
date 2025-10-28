"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileIcon } from "lucide-react";
import { toast } from "sonner";
import { getDocuments, createDocument, type Document } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import Item from "./item";

interface DocumentListProps {
  type: "studyhub" | "private";
  parentDocumentId?: string;
  level?: number;
}

const DocumentList = ({
  type,
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [type, parentDocumentId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getDocuments(type, parentDocumentId || null);
      setDocuments(docs);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(error.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const onExpand = (documentId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  if (isLoading) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      {documents.length === 0 && level === 0 && (
        <p
          className={cn(
            "text-sm font-medium text-muted-foreground/80 px-3 py-1",
            level > 0 && "hidden"
          )}
        >
          No documents
        </p>
      )}
      {documents.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            onClick={() => router.push(`/documents/${document.id}`)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={false}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
          />
          {expanded[document.id] && (
            <DocumentList
              type={type}
              parentDocumentId={document.id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default DocumentList;