import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';

export function useFirestoreQuery(queryRef, dependencies = []) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!queryRef) {
      setData([]);
      return;
    }
    
    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setData(docs);
    }, (error) => {
      console.error("Lỗi lấy dữ liệu Firestore:", error);
      setData([]);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return data;
}
