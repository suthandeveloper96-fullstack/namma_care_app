import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page">
      <EmptyState
        icon={Compass}
        title="We couldn’t find that page"
        actions={
          <>
            <Button to="/" variant="primary">
              Go to home
            </Button>
            <Button to="/doctors">Find doctors</Button>
          </>
        }
      >
        The link may be broken or the page may have moved.
      </EmptyState>
    </div>
  );
}
