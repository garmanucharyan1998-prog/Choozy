import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "contexts";

const AUTH_MODES = {
  REGISTER: "register",
  LOGIN: "login",
};

export const useAuthModalPresenter = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState(AUTH_MODES.REGISTER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setMode(AUTH_MODES.REGISTER);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const clearError = useCallback(() => setError(""), []);

  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      clearError();
    },
    [clearError],
  );

  const handlePasswordChange = useCallback(
    (event) => {
      setPassword(event.target.value);
      clearError();
    },
    [clearError],
  );

  const handleConfirmPasswordChange = useCallback(
    (event) => {
      setConfirmPassword(event.target.value);
      clearError();
    },
    [clearError],
  );

  const switchToLogin = useCallback(() => {
    setMode(AUTH_MODES.LOGIN);
    setConfirmPassword("");
    setError("");
  }, []);

  const switchToRegister = useCallback(() => {
    setMode(AUTH_MODES.REGISTER);
    setConfirmPassword("");
    setError("");
  }, []);

  const handleLoginSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!email.trim() || !password.trim()) {
        setError(t("login.errors.required"));
        return;
      }

      onSuccess?.();
      onClose();
    },
    [email, password, onClose, onSuccess, t],
  );

  const handleRegisterSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError(t("register.errors.required"));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("register.errors.passwordMismatch"));
        return;
      }

      onSuccess?.();
      onClose();
    },
    [confirmPassword, email, onClose, onSuccess, password, t],
  );

  const isRegisterMode = mode === AUTH_MODES.REGISTER;

  return {
    isRegisterMode,
    email,
    password,
    confirmPassword,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    switchToLogin,
    switchToRegister,
  };
};

export default useAuthModalPresenter;
