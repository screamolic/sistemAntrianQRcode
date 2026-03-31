"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary component that catches JavaScript errors in child components
 * and displays a fallback UI with recovery options
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onReset?.()
  }

  handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
    } else {
      this.handleReset()
    }
  }

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Don&apos;t worry, you can try to recover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="text-xs font-mono break-all">
                  {this.state.error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={this.handleReset} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              <Button onClick={this.handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Go Back
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Global error handler for unhandled promise rejections
 */
export function GlobalErrorHandler() {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      // In production, send to error tracking service
    }

    const handleError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error)
      // In production, send to error tracking service
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  return null
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler(onError?: (error: Error) => void) {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (onError) {
        onError(event.error)
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (onError) {
        onError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [onError])
}

/**
 * Error display component for inline errors
 */
interface InlineErrorProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function InlineError({ message = "An error occurred", onRetry, className }: InlineErrorProps) {
  return (
    <Alert variant="destructive" className={className} role="alert">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center gap-2 mt-2">
        {message}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-auto">
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
