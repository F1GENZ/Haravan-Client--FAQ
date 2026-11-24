import {
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  TRIAL_EXPIRED_MESSAGE,
} from "../lib/messages";

const STATUS_MESSAGES = {
  400: "Dữ liệu không hợp lệ.",
  408: "Đường truyền mạng không ổn định.",
  502: "502 Bad Gateway",
  503: "Không tìm thấy thông tin máy chủ.",
  504: "Không nhận được phản hồi từ máy chủ.",
};

export function toResult(response) {
  const body = response?.data ?? {};
  return {
    success: response.status >= 200 && response.status < 300,
    status: response.status,
    data: body.data ?? null,
    errorCode: body.errorCode ?? null,
    errorMessage: body.errorMessage ?? null,
  };
}

export function toResultError(error) {
  const status = error?.response?.status ?? 0;
  const body = error?.response?.data;

  const result = {
    success: false,
    status,
    data: null,
    errorCode: body?.errorCode ?? body?.error ?? null,
    errorMessage: body?.errorMessage ?? body?.message ?? null,
  };

  if (status === 401) {
    result.errorMessage = SESSION_EXPIRED_MESSAGE;
    result.errorCode = "Unauthorized";
  } else if (status === 402) {
    result.errorMessage = TRIAL_EXPIRED_MESSAGE;
    result.errorCode = "PaymentRequired";
  } else if (status === 0) {
    result.errorMessage = NETWORK_ERROR_MESSAGE;
    result.errorCode = "NetworkError";
  } else if (!result.errorMessage && STATUS_MESSAGES[status]) {
    result.errorMessage = STATUS_MESSAGES[status];
  }

  return result;
}
