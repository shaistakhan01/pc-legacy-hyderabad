# PC Legacy Hyderabad — Entity Relationship Diagram

Source of truth for the schema implemented in Phase 2 migrations.
Update this file whenever a migration adds/changes a table.

\`\`\`mermaid
erDiagram
    PROFILES ||--o{ BOOKINGS : places
    PROFILES ||--o{ GUESTS : "entered by (staff)"
    PROFILES ||--o{ STAFF_INVITES : invites
    PROFILES ||--o{ AUDIT_LOGS : performs

    GUESTS ||--o{ BOOKINGS : "walk-in owner"

    BOOKINGS ||--o| ROOM_BOOKINGS : "1:1 detail"
    BOOKINGS ||--o| RESTAURANT_RESERVATIONS : "1:1 detail"
    BOOKINGS ||--o| BANQUET_BOOKINGS : "1:1 detail"
    BOOKINGS ||--o| CONFERENCE_BOOKINGS : "1:1 detail"
    BOOKINGS ||--o{ PAYMENT_TRANSACTIONS : has

    ROOM_TYPES ||--o{ ROOMS : "has many"
    ROOM_TYPES ||--o{ ROOM_RATE_CALENDAR : "seasonal rates"
    ROOMS ||--o{ ROOM_BOOKINGS : booked

    RESTAURANT_TABLES ||--o{ RESTAURANT_RESERVATIONS : booked

    EVENT_HALLS ||--o{ BANQUET_BOOKINGS : booked
    HALL_ADD_ONS }o--o{ BANQUET_BOOKINGS : "selected on"

    CONFERENCE_ROOMS ||--o{ CONFERENCE_BOOKINGS : booked

    PROFILES {
        uuid id PK
        text full_name
        text phone
        text role
    }
    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid guest_id FK
        text module_type
        text reference_number
        text status
        numeric total_amount
    }
    ROOM_TYPES {
        uuid id PK
        text name
        numeric base_price
        int max_occupancy
    }
    ROOMS {
        uuid id PK
        text room_number
        uuid room_type_id FK
        text status
    }
    ROOM_BOOKINGS {
        uuid id PK
        uuid booking_id FK
        uuid room_id FK
        date check_in
        date check_out
    }
    RESTAURANT_TABLES {
        uuid id PK
        text table_number
        int capacity
    }
    RESTAURANT_RESERVATIONS {
        uuid id PK
        uuid booking_id FK
        uuid table_id FK
        date reservation_date
        time reservation_time
    }
    EVENT_HALLS {
        uuid id PK
        text name
        numeric base_price
    }
    BANQUET_BOOKINGS {
        uuid id PK
        uuid booking_id FK
        uuid hall_id FK
        date event_date
    }
    CONFERENCE_ROOMS {
        uuid id PK
        text name
        numeric hourly_rate
    }
    CONFERENCE_BOOKINGS {
        uuid id PK
        uuid booking_id FK
        uuid room_id FK
        date date
    }
    PAYMENT_TRANSACTIONS {
        uuid id PK
        uuid booking_id FK
        text status
        numeric amount
    }
    GUESTS {
        uuid id PK
        text full_name
        text phone
    }
    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        text action
    }
    STAFF_INVITES {
        uuid id PK
        text email
        text role
        text status
    }
\`\`\`

## Table Category Summary (drives RLS policy design in 2.3)

| Category | Tables | Access Pattern |
|---|---|---|
| **Public read / admin write** | `room_types`, `rooms`, `room_rate_calendar`, `restaurant_tables`, `menu_items`, `event_halls`, `hall_add_ons`, `conference_rooms` | `SELECT` open to everyone; writes restricted to `staff`/`admin`/`super_admin` |
| **User-owned** | `bookings`, `room_bookings`, `restaurant_reservations`, `banquet_bookings`, `conference_bookings` | Owner (`auth.uid() = user_id`, traced through `bookings`) or staff/admin |
| **Admin-only** | `payment_transactions`, `audit_logs`, `staff_invites` | Staff/admin/super_admin only, never exposed to `anon` |
| **Self-managed** | `profiles` | User can read/update own row; staff/admin can read all |
| **Staff-entered** | `guests` | Staff/admin only (walk-in/phone bookings) |