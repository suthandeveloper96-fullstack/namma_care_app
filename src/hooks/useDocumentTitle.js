import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · NammaCare` : 'NammaCare — Know Before You Go';
  }, [title]);
}
