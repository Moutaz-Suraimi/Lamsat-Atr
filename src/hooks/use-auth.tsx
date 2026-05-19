import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export function useAuth() {
  // session is kept for backwards compatibility in the return object if needed, 
  // but Firebase usually just uses User
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setSession(currentUser ? { user: currentUser } : null);
      
      if (currentUser) {
        try {
          const rolesRef = collection(db, "user_roles");
          const q = query(rolesRef, where("user_id", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          let hasAdminRole = false;
          querySnapshot.forEach((doc) => {
            if (doc.data().role === "admin") {
              hasAdminRole = true;
            }
          });
          
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error("Error fetching user roles:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { 
    session, 
    user, 
    loading, 
    isAdmin, 
    signOut: () => firebaseSignOut(auth) 
  };
}
