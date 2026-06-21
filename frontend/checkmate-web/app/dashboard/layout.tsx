import { PanelShell } from "@/components/panel-shell";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return <PanelShell section="owner">{children}</PanelShell>;
}