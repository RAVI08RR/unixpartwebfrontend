import React from "react";

export function TableContainer({ children, className = "", ...props }) {
  return (
    <div 
      className={`bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm w-full max-w-full overflow-hidden responsive-table-container ${className}`}
      {...props}
    >
      <div className="overflow-x-auto w-full scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

export function Table({ children, className = "", minWidth = "800px", style = {}, ...props }) {
  return (
    <table 
      className={`w-full border-collapse ${className}`} 
      style={{ minWidth, ...style }}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={className} {...props}>
      <tr className="border-b border-gray-100 dark:border-zinc-800/50 bg-gray-50/10 dark:bg-zinc-800/10">
        {children}
      </tr>
    </thead>
  );
}

export function TableHeaderCell({ children, className = "", style = {}, ...props }) {
  return (
    <th 
      className={`px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ${className}`}
      style={style}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={`divide-y divide-gray-100 dark:divide-zinc-800/50 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", onClick, style = {}, ...props }) {
  return (
    <tr 
      onClick={onClick}
      className={`group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", style = {}, ...props }) {
  return (
    <td 
      className={`px-6 py-5 text-sm text-gray-900 dark:text-white leading-normal align-middle ${className}`}
      style={style}
      {...props}
    >
      {children}
    </td>
  );
}
