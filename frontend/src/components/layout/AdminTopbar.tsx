// // Admin shell topbar — design doc §3.1.B.
// // Search (command palette), notifications, and profile menu are structural
// // placeholders — wired to real functionality once Auth (Phase 3) and
// // the relevant modules exist.
// export function AdminTopbar() {
//   return (
//     <div className="flex items-center justify-between border-b border-neutral-200 bg-surface px-6 py-3">
//       <input
//         type="search"
//         placeholder="Search... (⌘K)"
//         className="w-64 rounded-sm border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-primary"
//       />
//       <div className="flex items-center gap-4">
//         <button
//           aria-label="Notifications"
//           className="text-xl text-neutral-700 transition-colors hover:text-primary"
//         >
//           🔔
//         </button>
//         <div
//           role="button"
//           aria-label="Profile menu"
//           className="h-8 w-8 rounded-pill bg-primary/20 cursor-pointer"
//         />
//       </div>
//     </div>
//   );
// }


export function AdminTopbar() {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-surface px-6 py-3">
      <input
        type="search"
        placeholder="Search... (⌘K)"
        className="w-64 rounded-sm border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-primary"
      />
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="text-xl text-neutral-700 transition-colors hover:text-primary"
        >
          🔔
        </button>
        <div
          role="button"
          aria-label="Profile menu"
          className="h-8 w-8 rounded-pill bg-primary/20 cursor-pointer"
        />
      </div>
    </div>
  );
}