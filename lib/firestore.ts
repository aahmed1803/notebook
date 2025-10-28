import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

export interface Document {
  id: string;
  title: string;
  userId: string;
  parentDocument: string | null;
  type: "studyhub" | "private";
  isSubject: boolean;
  isArchived: boolean;
  icon?: string | null;
  coverImage?: string | null;  // ← Make sure this is here
  content?: string;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}

// Create a new document
export const createDocument = async (data: {
  title: string;
  parentDocument?: string | null;
  type: "studyhub" | "private";
  isSubject?: boolean;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docData = {
    title: data.title,
    userId: user.uid,
    parentDocument: data.parentDocument || null,
    type: data.type,
    isSubject: data.isSubject || false,
    isArchived: false,
    icon: null,
    coverImage: null,
    content: "",
    isPublished: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "documents"), docData);
  return docRef.id;
};

// Get all documents for current user
export const getDocuments = async (
  type?: "studyhub" | "private",
  parentDocument?: string | null
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  let q = query(
    collection(db, "documents"),
    where("userId", "==", user.uid),
    where("isArchived", "==", false),
    orderBy("createdAt", "desc")
  );

  if (type) {
    q = query(q, where("type", "==", type));
  }

  if (parentDocument !== undefined) {
    q = query(q, where("parentDocument", "==", parentDocument));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
};

// Get a single document
export const getDocument = async (documentId: string) => {
  const docRef = doc(db, "documents", documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Document not found");
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Document;
};

// Update a document
export const updateDocument = async (
  documentId: string,
  data: Partial<Document>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "documents", documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Archive a document (soft delete)
export const archiveDocument = async (documentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "documents", documentId);
  await updateDoc(docRef, {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
};

// Get archived documents
export const getArchivedDocuments = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, "documents"),
    where("userId", "==", user.uid),
    where("isArchived", "==", true),
    orderBy("updatedAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
};

// Restore a document from trash
export const restoreDocument = async (documentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "documents", documentId);
  await updateDoc(docRef, {
    isArchived: false,
    updatedAt: serverTimestamp(),
  });
};

// Permanently delete a document
export const deleteDocument = async (documentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, "documents", documentId);
  await deleteDoc(docRef);
};

// Get children of a document (for nested notes)
export const getChildDocuments = async (parentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, "documents"),
    where("userId", "==", user.uid),
    where("parentDocument", "==", parentId),
    where("isArchived", "==", false),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
};