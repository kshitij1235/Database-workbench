import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/themeProvider";

export const metadata: Metadata = {
  title: "Database Workbench - Design & Optimize Your Database",
  description: "Database Workbench helps you design, model, and optimize databases efficiently. Create structured schemas, visualize relationships, and enhance query performance with ease.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "Database Workbench",
    "Database Design",
    "DBMS",
    "SQL Schema",
    "Data Modeling",
    "Query Optimization",
    "Relational Databases",
    "ER Diagrams",
    "SQL Performance",
    "DBML"
  ],
  openGraph: {
    title: "Database Workbench - Design & Optimize Your Database",
    description: "Create efficient database schemas, visualize data relationships, and optimize performance with Database Workbench.",
    type: "website"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
