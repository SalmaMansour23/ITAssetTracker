# **App Name**: GlowIT Assets

## Core Features:

- Employee Request Portal: A multi-step, animated form for employees to submit requests for IT assets (laptops, software, hardware) with real-time validation and feedback.
- AI Request Assistant: An AI tool that suggests relevant information, similar past requests, or recommends standard assets based on the employee's request reason during submission.
- Admin Tracking Dashboard: A live-updating dashboard presenting all IT asset requests in a customizable grid/table layout for IT administrators.
- Interactive Status Management: IT staff can update request statuses (Pending, Approved, Rejected) via a quick-action popover triggered by clicking a status badge on the dashboard.
- Real-time Data Sync: Utilize Supabase Realtime to ensure all status updates and new requests are instantly reflected across all connected clients for both employees and administrators.

## Style Guidelines:

- Primary color: A vibrant Electric Blue (#3399FF) to create a striking focal point against a dark theme. It signifies dynamism and modernity, suitable for primary actions and highlights.
- Background color: A very dark, desaturated variant of the primary hue (#16191D). This provides a deep, immersive dark-mode canvas, allowing neon accents and glassmorphism effects to truly stand out.
- Accent color: A warm, bright Sunset Orange (#FF9933) chosen to provide a compelling contrast and visual hierarchy, effectively drawing attention to secondary actions and 'Pending' statuses. Additional colors for 'Approved' (pulsing green, e.g., #00CC00) and 'Rejected' (subtle red, e.g., #FF3333) will be used as dynamic status indicators.
- Headlines: 'Space Grotesk' (sans-serif), for a modern, slightly futuristic and clean aesthetic. Body text: 'Inter' (sans-serif), providing excellent legibility and a neutral, professional feel that complements the high-tech visual design.
- Sleek, minimalist vector icons with an optional neon glow effect for interactive states. Focus on clarity and consistency, reinforcing the ultra-modern and high-end aesthetic.
- Sidebar-based dashboard navigation combined with a subtle, floating top navigation bar. The main content area will feature a 'Bento Box' grid layout for key statistics and asset overviews, optimized for responsive design across devices.
- Utilize Framer Motion for smooth, deliberate transitions and interactive elements. This includes 'staggered' entry animations for list items, subtle hover-scale effects (scale: 1.02) with glow shadows on cards and buttons, and dynamic 'Status Glow' indicators (pulsing green for Approved, subtle red shake for Rejected on hover).