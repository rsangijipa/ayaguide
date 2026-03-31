'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#020202] p-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex max-w-md flex-col items-center rounded-[32px] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-400/10 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-light tracking-wide">Algo deu errado</h1>
            <p className="mb-8 text-sm font-light leading-relaxed text-white/40 tracking-wide">
              Desculpe, ocorreu um erro inesperado ao carregar a sessão sagrada.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-8 py-4 text-sm font-light tracking-wider hover:bg-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Recarregar Aplicação
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 overflow-auto text-left text-[10px] text-red-400/60 max-h-32 w-full p-4 bg-black/40 rounded-xl">
                {this.state.error.toString()}
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
