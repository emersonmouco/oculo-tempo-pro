import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Fornecedores from "./pages/Fornecedores";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import PDV from "./pages/PDV";
import OSRelojoaria from "./pages/OSRelojoaria";
import Prescricoes from "./pages/Prescricoes";
import Montagem from "./pages/Montagem";
import Estoque from "./pages/Estoque";
import Compras from "./pages/Compras";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import Configuracoes from "./pages/Configuracoes";
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
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/armacoes" element={<Produtos />} />
            <Route path="/lentes" element={<Produtos />} />
            <Route path="/relogios" element={<Produtos />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/orcamentos" element={<Vendas />} />
            <Route path="/prescricoes" element={<Prescricoes />} />
            <Route path="/montagem" element={<Montagem />} />
            <Route path="/os-relojoaria" element={<OSRelojoaria />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
