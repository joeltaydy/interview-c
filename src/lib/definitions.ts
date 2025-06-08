export type AlertProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // Duration in milliseconds (default is 3000ms)
  onDismiss?: () => void;
};

export type DescendantNode = {
  id: string;
  data: {
    name: string;
    category?: string;
  };
};

export type System = {
  id: string;
  name: string;
  category?: string;
};

export type Hierarchy = {
  parent_id: string;
  child_id: string;
};

export type Interface = {
  id: string;
  system_a_id: string;
  system_b_id: string;
  directional: string;
  connection_type: string;
};
