import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import OSRelojoaria from "./pages/OSRelojoaria";
import Prescricoes from "./pages/Prescricoes";
import Montagem from "./pages/Montagem";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/armacoes" element={<Produtos />} />
            <Route path="/lentes" element={<Produtos />} />
            <Route path="/relogios" element={<Produtos />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/orcamentos" element={<Vendas />} />
            <Route path="/prescricoes" element={<Prescricoes />} />
            <Route path="/montagem" element={<Montagem />} />
            <Route path="/os-relojoaria" element={<OSRelojoaria />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/compras" element={<Estoque />} />
            <Route path="/financeiro" element={<Dashboard />} />
            <Route path="/agenda" element={<Dashboard />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
