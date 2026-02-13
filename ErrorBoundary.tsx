import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "2rem", backgroundColor: "#0f172a", color: "#ef4444", height: "100vh", fontFamily: "sans-serif" }}>
                    <h1>Ocorreu um erro crítico no sistema.</h1>
                    <h2 style={{ color: "white" }}>{this.state.error?.message}</h2>
                    <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem", color: "#94a3b8" }}>
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: "2rem", padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}
                    >
                        Recarregar Aplicação
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
