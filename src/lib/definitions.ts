export type AlertProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // Duration in milliseconds (default is 3000ms)
  onDismiss?: () => void;
};
