import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Incident } from '../types/incident';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'incidents'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const incidentData: Incident[] = [];
        snapshot.forEach((doc) => {
          incidentData.push({
            id: doc.id,
            ...doc.data()
          } as Incident);
        });
        setIncidents(incidentData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching incidents:', err);
        setError('Failed to fetch incidents');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { incidents, loading, error };
};