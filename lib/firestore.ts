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
  coverImage?: string | null;
  content?: string;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
  // Study Hub sharing fields
  shareCode?: string | null;
  sharedWith?: string[]; // Array of user IDs who have access
  isShared?: boolean;
}

// Generate a random 6-character share code
export const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create or update share code for a study hub
export const createShareCode = async (documentId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const shareCode = generateShareCode();
  const docRef = doc(db, "documents", documentId);
  
  await updateDoc(docRef, {
    shareCode,
    isShared: true,
    sharedWith: [user.uid], // Owner is always included
    updatedAt: serverTimestamp(),
  });

  return shareCode;
};

// Join a study hub using a share code
export const joinStudyHub = async (shareCode: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  // Find the document with this share code
  const q = query(
    collection(db, "documents"),
    where("shareCode", "==", shareCode.toUpperCase()),
    where("type", "==", "studyhub"),
    where("isShared", "==", true)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error("Invalid share code");
  }

  const docData = querySnapshot.docs[0].data();

  // Check if user is already a member
  if (docData.sharedWith && docData.sharedWith.includes(user.uid)) {
    throw new Error("You are already a member of this study hub");
  }

  // Add user to sharedWith array
  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, {
    sharedWith: [...(docData.sharedWith || []), user.uid],
    updatedAt: serverTimestamp(),
  });

  return querySnapshot.docs[0].id;
};

// Get shared study hubs for current user
export const getSharedStudyHubs = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, "documents"),
    where("type", "==", "studyhub"),
    where("isShared", "==", true),
    where("sharedWith", "array-contains", user.uid),
    where("isArchived", "==", false),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
};

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
    shareCode: null,
    sharedWith: data.type === "studyhub" ? [user.uid] : [],
    isShared: false,
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

  if (type === "studyhub") {
    // For study hubs, get both owned and shared
    const ownedQuery = query(
      collection(db, "documents"),
      where("userId", "==", user.uid),
      where("type", "==", "studyhub"),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );

    const sharedStudyHubs = await getSharedStudyHubs();
    const ownedSnapshot = await getDocs(ownedQuery);
    const ownedDocs = ownedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Document[];

    // Combine and deduplicate
    const allHubs = [...ownedDocs, ...sharedStudyHubs];
    const uniqueHubs = Array.from(
      new Map(allHubs.map(hub => [hub.id, hub])).values()
    );

    // Filter by parentDocument if specified
    if (parentDocument !== undefined) {
      return uniqueHubs.filter(hub => hub.parentDocument === parentDocument);
    }

    return uniqueHubs;
  }

  // Original logic for private documents
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

  // Get the parent document to check if it's shared
  const parentDoc = await getDocument(parentId);

  let q;
  
  if (parentDoc.isShared && parentDoc.sharedWith?.includes(user.uid)) {
    // If it's a shared study hub, get all children regardless of userId
    q = query(
      collection(db, "documents"),
      where("parentDocument", "==", parentId),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );
  } else {
    // Otherwise, only get user's own children
    q = query(
      collection(db, "documents"),
      where("userId", "==", user.uid),
      where("parentDocument", "==", parentId),
      where("isArchived", "==", false),
      orderBy("createdAt", "desc")
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
};