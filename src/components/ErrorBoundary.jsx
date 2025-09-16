import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hata loglama için burayı genişletebilirsiniz
    console.error("Component error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          Bir bileşen yüklenirken hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </div>
      );
    }
    return this.props.children;
  }
}
