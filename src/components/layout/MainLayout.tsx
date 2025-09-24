import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Header Global */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border flex items-center px-4">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EO</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-foreground">ERP Ótica & Relojoaria</h1>
              <p className="text-xs text-muted-foreground">Sistema Integrado de Gestão</p>
            </div>
          </div>

          {/* Actions do Header */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-muted-foreground">Filial Centro</p>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <AppSidebar />

        {/* Conteúdo Principal */}
        <main className="flex-1 pt-14">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};