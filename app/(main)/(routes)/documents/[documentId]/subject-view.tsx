"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileIcon, Plus, UserPlus } from "lucide-react";
import { getChildDocuments, createDocument, updateDocument, type Document } from "@/lib/firestore";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/use-document";
import { useShareModal } from "@/hooks/use-share-modal";
import { debounce } from "lodash";

interface SubjectViewProps {
  subject: Document;
}

export const SubjectView = ({ subject }: SubjectViewProps) => {
  const router = useRouter();
  const [notes, setNotes] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localSubject, setLocalSubject] = useState(subject);
  const { addDocument, documentList, updateDocument: updateGlobalDocument } = useDocument();
  const shareModal = useShareModal();

  // Filter notes from global state
  const filteredNotes = documentList.filter(
    (doc) => doc.parentDocument === subject.id && !doc.isArchived
  );

  useEffect(() => {
    fetchNotes();
  }, [subject.id]);

  useEffect(() => {
    setLocalSubject(subject);
  }, [subject]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const childNotes = await getChildDocuments(subject.id);
      setNotes(childNotes);
    } catch (error: any) {
      toast.error(error.message || "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const documentId = await createDocument({
        title: "Untitled Note",
        type: subject.type,
        parentDocument: subject.id,
        isSubject: false,
      });

      const { getDocument } = await import("@/lib/firestore");
      const newNote = await getDocument(documentId);
      addDocument(newNote);

      toast.success("Note created!");
      router.push(`/documents/${documentId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create note");
    }
  };

  const handleTitleChange = useCallback(
    debounce(async (documentId: string, title: string) => {
      try {
        await updateDocument(documentId, { title });
        updateGlobalDocument(documentId, { title });
      } catch (error: any) {
        console.error("Error updating title:", error);
        toast.error("Failed to update title");
      }
    }, 500),
    []
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Use global state if available, otherwise use local state
  const displayNotes = filteredNotes.length > 0 ? filteredNotes : notes;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 border-b bg-background">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex-1 min-w-0 mr-4">
            <input
              type="text"
              className="text-4xl font-bold leading-tight bg-transparent border-none outline-none w-full resize-none py-1"
              value={localSubject.title}
              onChange={(e) => {
                setLocalSubject({ ...localSubject, title: e.target.value });
                updateGlobalDocument(localSubject.id, { title: e.target.value });
                handleTitleChange(localSubject.id, e.target.value);
              }}
              placeholder="Untitled Subject"
            />
            <p className="text-muted-foreground mt-2">
              {displayNotes.length} {displayNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {subject.type === "studyhub" && (
              <Button
                variant="outline"
                onClick={() => shareModal.onOpen(subject.id, subject.shareCode)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Others
              </Button>
            )}
            <Button onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {displayNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first note to get started
              </p>
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/documents/${note.id}`)}
                  className="group border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-card"
                >
                  {note.coverImage && (
                    <div className="mb-3 rounded overflow-hidden">
                      <img
                        src={note.coverImage}
                        alt={note.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-2 mb-2">
                    {note.icon && (
                      <span className="text-2xl">{note.icon}</span>
                    )}
                    <h3 className="font-semibold line-clamp-2 flex-1">
                      {note.title}
                    </h3>
                  </div>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {(() => {
                        try {
                          const parsed = JSON.parse(note.content);
                          const text = parsed
                            .map((block: any) => {
                              if (block.content) {
                                return block.content
                                  .map((c: any) => c.text || "")
                                  .join("");
                              }
                              return "";
                            })
                            .join(" ");
                          return text || "No content";
                        } catch {
                          return "No content";
                        }
                      })()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};