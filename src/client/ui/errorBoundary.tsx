// taken from https://github.com/littensy/slither/blob/6540d0fa974c2bc8945a3969968b9a4d267388a6/src/client/components/ui/error-boundary.tsx#L13

import React, { Component, ErrorInfo, ReactComponent } from "@rbxts/react";

interface ErrorBoundaryProps {
  fallback: (error: unknown) => React.Element;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: unknown;
}

@ReactComponent
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public componentDidCatch(message: unknown, info: ErrorInfo) {
    warn(message, info.componentStack);

    this.setState({
      hasError: true,
      message: `${message} ${info.componentStack}`,
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.message);
    } else {
      return this.props.children;
    }
  }
}