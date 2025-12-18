import React from "react";

interface BentoGridItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  onClick?: () => void;
  action?: React.ReactNode;
  background?: React.ReactNode;
  color?:
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "default";
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  title,
  description,
  icon,
  colSpan = 1,
  rowSpan = 1,
  onClick,
  action,
  background,
  color = "default",
}) => {
  const getColorClasses = () => {
    const colorMap: Record<string, string> = {
      primary: "bg-blue-100 text-blue-900 hover:border-blue-600",
      secondary: "bg-teal-100 text-teal-900 hover:border-teal-600",
      info: "bg-blue-50 text-blue-800 hover:border-blue-500",
      success: "bg-teal-50 text-teal-800 hover:border-teal-500",
      warning: "bg-orange-50 text-orange-800 hover:border-orange-500",
      error: "bg-red-50 text-red-800 hover:border-red-500",
      default: "bg-white text-gray-900 hover:border-primary",
    };
    return colorMap[color] || colorMap.default;
  };

  return (
    <div
      className={`
        relative overflow-hidden h-full
        p-6 rounded-2xl border border-gray-200
        flex flex-col justify-between
        transition-all duration-300 ease-out
        shadow-lg hover:shadow-xl hover:-translate-y-1
        ${getColorClasses()}
        ${onClick ? "cursor-pointer" : "cursor-default"}
        md:col-span-${colSpan} md:row-span-${rowSpan}
      `}
      onClick={onClick}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {background && (
        <div className="absolute inset-0 z-0 opacity-10">{background}</div>
      )}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          {icon && (
            <div
              className={`
                p-3 rounded-lg
                flex items-center justify-center
                shadow-sm
                ${color === "default" ? "bg-gray-100" : "bg-white bg-opacity-20"}
              `}
            >
              {icon}
            </div>
          )}
          {action}
        </div>
        <div className="mt-auto">
          <h3 className="text-xl font-bold tracking-tight leading-tight mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm opacity-70 leading-relaxed text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const BentoGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[minmax(180px,auto)]">
      {children}
    </div>
  );
};
