import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const clientSchema = z.object({
  // Person fields
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  phone: z.string().optional(),
  mobilePhone: z.string().min(1, "Celular é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  
  // Legal Person fields
  companyName: z.string().min(1, "Razão social é obrigatória"),
  supplierCode: z.string().optional(),
  isActive: z.boolean().default(true),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  websiteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  faxNumber: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  businessActivityCode: z.string().optional(),
  taxRegime: z.string().optional(),
  isTaxExempt: z.boolean().default(false),
  supplierSince: z.date().optional(),
  observations: z.string().optional(),
  legalRepresentativeName: z.string().optional(),
  legalRepresentativePhone: z.string().optional(),
  contactPerson: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTime: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      isActive: true,
      isTaxExempt: false,
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      // First, insert the person
      const { data: personData, error: personError } = await db
        .from("persons")
        .insert({
          name: data.name,
          birth_date: data.birthDate.toISOString().split('T')[0],
          phone: data.phone || null,
          mobile_phone: data.mobilePhone,
          email: data.email || null,
        })
        .select()
        .single();

      if (personError) throw personError;

      // Then, insert the legal person
      const { error: legalPersonError } = await supabase
        .from("legal_persons")
        .insert({
          person_id: personData.id,
          company_name: data.companyName,
          supplier_code: data.supplierCode || null,
          is_active: data.isActive,
          trade_name: data.tradeName || null,
          cnpj: data.cnpj || null,
          state_registration: data.stateRegistration || null,
          municipal_registration: data.municipalRegistration || null,
          website_url: data.websiteUrl || null,
          fax_number: data.faxNumber || null,
          contact_email: data.contactEmail || null,
          business_activity_code: data.businessActivityCode || null,
          tax_regime: data.taxRegime || null,
          is_tax_exempt: data.isTaxExempt,
          supplier_since: data.supplierSince?.toISOString().split('T')[0] || null,
          observations: data.observations || null,
          legal_representative_name: data.legalRepresentativeName || null,
          legal_representative_phone: data.legalRepresentativePhone || null,
          contact_person: data.contactPerson || null,
          payment_terms: data.paymentTerms || null,
          delivery_time: data.deliveryTime || null,
        });

      if (legalPersonError) throw legalPersonError;

      toast({
        title: "Fornecedor cadastrado com sucesso!",
        description: "O fornecedor foi adicionado ao sistema.",
      });

      form.reset();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Erro ao cadastrar fornecedor",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Fornecedor</h1>
          <p className="text-muted-foreground">Adicione um novo fornecedor ao sistema</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="additional">Informações Adicionais</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 3333-3333" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social *</FormLabel>
                          <FormControl>
                            <Input placeholder="Razão social da empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tradeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome fantasia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Fornecedor</FormLabel>
                          <FormControl>
                            <Input placeholder="Código único" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stateRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input placeholder="Inscrição estadual" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="municipalRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Municipal</FormLabel>
                          <FormControl>
                            <Input placeholder="Inscrição municipal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Fornecedor Ativo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isTaxExempt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Isento de Impostos</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="legalRepresentativeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Representante Legal</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do representante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalRepresentativePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do Representante</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pessoa de Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da pessoa de contato" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierSince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente Desde</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condições de Pagamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 30 dias" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo de Entrega</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 5 dias úteis" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais sobre o cliente..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Limpar
            </Button>
            <Button type="submit" disabled={isLoading} className="erp-button-primary">
              {isLoading ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Fornecedor
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}