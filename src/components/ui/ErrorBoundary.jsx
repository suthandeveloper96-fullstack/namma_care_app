import { Component } from 'react';
import { ErrorState } from './EmptyState';

/** Catches render errors in a route so one broken page doesn't blank the whole app. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[NammaCare] Page crashed', error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page">
        <ErrorState
          title="This page couldn't be displayed"
          actions={
            <>
              <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
                Reload page
              </button>
              <a className="btn btn--secondary" href="/">
                Go to home
              </a>
            </>
          }
        >
          An unexpected error occurred. If it keeps happening, use “Reset demo data” in the footer to clear locally stored
          demo data.
        </ErrorState>
      </div>
    );
  }
}
