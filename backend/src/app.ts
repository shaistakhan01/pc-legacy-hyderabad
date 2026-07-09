import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import staffInvitesRoutes from "./routes/staffInvites.routes.js";
import roomBookingsRoutes from "./routes/roomBookings.routes.js";
import restaurantReservationsRoutes from "./routes/restaurantReservations.routes.js";
import banquetBookingsRoutes from "./routes/banquetBookings.routes.js";
import conferenceBookingsRoutes from "./routes/conferenceBookings.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import guestsRoutes from "./routes/guests.routes.js";
import guestDocumentsRoutes from "./routes/guestDocuments.routes.js";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", healthRoutes);
  app.use("/api/v1/staff-invites", staffInvitesRoutes);
  app.use("/api/v1/room-bookings", roomBookingsRoutes);
  app.use("/api/v1/restaurant-reservations", restaurantReservationsRoutes);
  app.use("/api/v1/banquet-bookings", banquetBookingsRoutes);
  app.use("/api/v1/conference-bookings", conferenceBookingsRoutes);
  app.use("/api/v1/payments", paymentsRoutes);
  app.use("/api/v1/staff", staffRoutes);
  app.use("/api/v1/guests", guestsRoutes);
  app.use("/api/v1/guests/:id/documents", guestDocumentsRoutes);


  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  });

  return app;
}