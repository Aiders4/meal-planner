import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              An unexpected error occurred. Please reload the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
