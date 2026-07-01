// // Site footer — design doc §3.1.A.
// // Present once per public/customer page at the bottom.
// export function Footer() {
//   return (
//     <footer className="border-t border-neutral-200 bg-surface">
//       <div className="mx-auto max-w-content px-6 py-12 text-sm text-neutral-700">
//         <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
//           <div>
//             <h4 className="mb-3 font-medium text-neutral-900">PC Legacy Hyderabad</h4>
//             <p>Your premier hospitality destination in Hyderabad, Telangana.</p>
//           </div>
//           <div>
//             <h4 className="mb-3 font-medium text-neutral-900">Contact</h4>
//             <p>Hyderabad, Telangana, India</p>
//           </div>
//           <div>
//             <h4 className="mb-3 font-medium text-neutral-900">Explore</h4>
//             <ul className="space-y-1">
//               <li><a href="/rooms"    className="hover:text-primary transition-colors">Rooms</a></li>
//               <li><a href="/dining"   className="hover:text-primary transition-colors">Dining</a></li>
//               <li><a href="/events"   className="hover:text-primary transition-colors">Events</a></li>
//               <li><a href="/meetings" className="hover:text-primary transition-colors">Meetings</a></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="mb-3 font-medium text-neutral-900">Policies</h4>
//             <ul className="space-y-1">
//               <li><a href="#" className="hover:text-primary transition-colors">Cancellation Policy</a></li>
//               <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
//             </ul>
//           </div>
//         </div>
//         <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400">
//           © {new Date().getFullYear()} PC Legacy Hyderabad. All rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// }


export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-surface">
      <div className="mx-auto max-w-content px-6 py-12 text-sm text-neutral-700">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-3 font-medium text-neutral-900">PC Legacy Hyderabad</h4>
            <p>Your premier hospitality destination in Hyderabad, Telangana.</p>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-neutral-900">Contact</h4>
            <p>Hyderabad, Telangana, India</p>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-neutral-900">Explore</h4>
            <ul className="space-y-1">
              <li><a href="/rooms"    className="hover:text-primary transition-colors">Rooms</a></li>
              <li><a href="/dining"   className="hover:text-primary transition-colors">Dining</a></li>
              <li><a href="/events"   className="hover:text-primary transition-colors">Events</a></li>
              <li><a href="/meetings" className="hover:text-primary transition-colors">Meetings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-neutral-900">Policies</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-primary transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} PC Legacy Hyderabad. All rights reserved.
        </div>
      </div>
    </footer>
  );
}