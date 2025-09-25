import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: "primary" | "secondary" | "highlight" | "none";
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  gradient = "none",
  onClick,
  size = "md",
}: GlassCardProps) {
  const gradientClasses = {
    primary: "hover:glow-primary",
    secondary: "hover:glow-secondary",
    highlight: "hover:glow-highlight",
    none: "",
  };

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      className={`
        glass-card ${sizeClasses[size]} transition-all duration-300
        ${hover ? "hover:scale-[1.02] hover:shadow-xl cursor-pointer" : ""}
        ${gradientClasses[gradient]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      whileHover={hover ? { y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}