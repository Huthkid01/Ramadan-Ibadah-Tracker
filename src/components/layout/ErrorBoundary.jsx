import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error', error, info)
  }

  render() {
    const { hasError } = this.state
    const { children } = this.props
    if (hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-light px-4 dark:bg-bg-dark">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-soft dark:bg-card-dark">
            <h1 className="mb-2 font-heading text-xl font-semibold text-slate-900 dark:text-slate-50">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The page could not be displayed. Please refresh or try again later.
            </p>
          </div>
        </div>
      )
    }
    return children
  }
}

