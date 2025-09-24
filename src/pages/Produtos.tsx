import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Package, 
  Eye, 
  Edit,
  Glasses,
  Watch,
  Plus
} from "lucide-react";

const Produtos = () => {
  // Dados mockados
  const armacoes = [
    {
      id: 1,
      sku: "RB5228-2000",
      marca: "Ray-Ban",
      modelo: "RB5228",
      cor: "Preto",
      tamanho: "52-17-140",
      material: "Acetato",
      preco: "R$ 459,90",
      estoque: 12,
      categoria: "Grau"
    },
    {
      id: 2,
      sku: "OK8156-0156",
      marca: "Oakley",
      modelo: "OX8156",
      cor: "Cinza",
      tamanho: "54-18-143",
      material: "Metal",
      preco: "R$ 689,90",
      estoque: 8,
      categoria: "Grau"
    }
  ];

  const lentes = [
    {
      id: 1,
      codigo: "CR39-SF",
      tipo: "Monofocal",
      material: "CR-39",
      indice: "1.50",
      tratamentos: ["Antirreflexo", "Antirrisco"],
      preco: "R$ 89,90",
      estoque: 45
    },
    {
      id: 2,
      codigo: "PROG-POL",
      tipo: "Progressiva",
      material: "Policarbonato",
      indice: "1.59",
      tratamentos: ["Antirreflexo", "Blue Light", "Fotossensível"],
      preco: "R$ 389,90",
      estoque: 23
    }
  ];

  const relogios = [
    {
      id: 1,
      marca: "Citizen",
      modelo: "Eco-Drive BM7100",
      movimento: "Solar",
      resistenciaAgua: "100m",
      material: "Aço Inox",
      preco: "R$ 890,00",
      estoque: 5
    },
    {
      id: 2,
      marca: "Casio",
      modelo: "G-Shock GA-2100",
      movimento: "Quartzo",
      resistenciaAgua: "200m",
      material: "Resina",
      preco: "R$ 650,00",
      estoque: 3
    }
  ];

  const getEstoqueColor = (estoque: number) => {
    if (estoque <= 5) return "status-cancelado";
    if (estoque <= 10) return "status-pendente";
    return "status-aprovado";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gerencie armações, lentes e relógios</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por SKU, marca, modelo..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Produtos */}
      <Tabs defaultValue="armacoes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="armacoes" className="flex items-center gap-2">
            <Glasses className="h-4 w-4" />
            Armações
          </TabsTrigger>
          <TabsTrigger value="lentes" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lentes
          </TabsTrigger>
          <TabsTrigger value="relogios" className="flex items-center gap-2">
            <Watch className="h-4 w-4" />
            Relógios
          </TabsTrigger>
        </TabsList>

        {/* Armações */}
        <TabsContent value="armacoes">
          <Card>
            <CardHeader>
              <CardTitle>Armações em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {armacoes.map((armacao) => (
                  <div key={armacao.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{armacao.marca} {armacao.modelo}</h3>
                          <Badge variant="outline">{armacao.categoria}</Badge>
                          <Badge className={getEstoqueColor(armacao.estoque)}>
                            Estoque: {armacao.estoque}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">SKU: </span>
                            <span className="font-medium">{armacao.sku}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cor: </span>
                            <span>{armacao.cor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tamanho: </span>
                            <span>{armacao.tamanho}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Material: </span>
                            <span>{armacao.material}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preço: </span>
                            <span className="font-bold text-primary">{armacao.preco}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lentes */}
        <TabsContent value="lentes">
          <Card>
            <CardHeader>
              <CardTitle>Lentes Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lentes.map((lente) => (
                  <div key={lente.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{lente.tipo} - {lente.material}</h3>
                          <Badge className={getEstoqueColor(lente.estoque)}>
                            Estoque: {lente.estoque}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Código: </span>
                            <span className="font-medium">{lente.codigo}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Índice: </span>
                            <span>{lente.indice}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tratamentos: </span>
                            <span>{lente.tratamentos.join(", ")}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preço: </span>
                            <span className="font-bold text-primary">{lente.preco}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relógios */}
        <TabsContent value="relogios">
          <Card>
            <CardHeader>
              <CardTitle>Relógios em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relogios.map((relogio) => (
                  <div key={relogio.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{relogio.marca} {relogio.modelo}</h3>
                          <Badge className={getEstoqueColor(relogio.estoque)}>
                            Estoque: {relogio.estoque}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Movimento: </span>
                            <span>{relogio.movimento}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resistência à Água: </span>
                            <span>{relogio.resistenciaAgua}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Material: </span>
                            <span>{relogio.material}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preço: </span>
                            <span className="font-bold text-primary">{relogio.preco}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Produtos;