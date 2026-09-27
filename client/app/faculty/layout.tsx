import FacultyAppShell from "@/components/layout/FacultyAppShell";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FacultyAppShell>{children}</FacultyAppShell>;
}
