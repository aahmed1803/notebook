"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileIcon, Plus } from "lucide-react";
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

  const handleCreateNote = async (parentId: string) => {
    try {
      const documentId = await createDocument({
        title: "Untitled Note",
        type,
        parentDocument: parentId,
        isSubject: false,
      });

      setExpanded((prev) => ({ ...prev, [parentId]: true }));
      toast.success("Note created!");
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || "Failed to create note");
    }
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
            onExpand={document.isSubject ? () => onExpand(document.id) : undefined}
            expanded={expanded[document.id]}
            isSubject={document.isSubject} // NEW: Pass isSubject prop
          />
          {/* Show nested notes only for subjects */}
          {document.isSubject && expanded[document.id] && (
            <>
              <DocumentList
                type={type}
                parentDocumentId={document.id}
                level={level + 1}
              />
              {/* Add note button */}
              <div
                onClick={() => handleCreateNote(document.id)}
                role="button"
                style={{
                  paddingLeft: `${(level + 1) * 12 + 12}px`,
                }}
                className="group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add note</span>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default DocumentList;