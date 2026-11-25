import { Component } from "react";
import { Button, Result } from "antd";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Ứng dụng gặp lỗi"
          subTitle="Tải lại trang để tiếp tục. Nếu lỗi vẫn còn, hãy đóng rồi mở lại ứng dụng từ trang quản trị Haravan."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
